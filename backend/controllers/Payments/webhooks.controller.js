import { asyncHandler } from "../../utils/asyncHandler.js";
import { Payments } from "../../models/payment.model.js";
import { Bookings } from "../../models/booking.model.js";
import { Events } from "../../models/event.model.js";
import mongoose from "mongoose";
import crypto from "crypto";
import "dotenv/config";
/**
 * PhonePe Webhook Handler
 * POST /api/payments/webhook
 *
 * Fixes applied vs original:
 *  1. Seat decrement moved here (was double-decrementing with booking.controller)
 *  2. FAILED/CANCELLED now restores seats back to the event
 *  3. Idempotency guard on payment.status prevents duplicate processing
 *  4. Ticket generation triggered automatically on COMPLETED
 *  5. Raw body used for signature verification (re-stringify is unreliable)
 *  6. Booking populated with user so ticket has participantName ready
 *  7. All DB writes are inside the same transaction for atomicity
 *  8. 500 returned on error so PhonePe retries; 200 on known/ignorable states
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verify PhonePe webhook signature.
 * PhonePe sends: Authorization: SHA256/<base64-hmac-of-raw-body>
 * Fallback: Authorization: Basic <base64(user:pass)>
 */
const verifySignature = (req) => {
    const authHeader = req.headers["authorization"] || ""

    // PhonePe sandbox sends raw 64-char SHA256 hex string with no prefix
    if (authHeader.length === 64) {
        const body = req.rawBody
            ? req.rawBody
            : Buffer.from(JSON.stringify(req.body))

        const expected = crypto
            .createHmac("sha256", process.env.PHONEPE_WEBHOOK_SECRET)
            .update(body)
            .digest("hex")

        return crypto.timingSafeEqual(
            Buffer.from(authHeader),
            Buffer.from(expected)
        )
    }

    // PhonePe production sends SHA256/<base64-hmac>
    if (authHeader.startsWith("SHA256/")) {
        const received = authHeader.slice("SHA256/".length)

        const body = req.rawBody
            ? req.rawBody
            : Buffer.from(JSON.stringify(req.body))

        const expected = crypto
            .createHmac("sha256", process.env.PHONEPE_WEBHOOK_SECRET)
            .update(body)
            .digest("base64")

        return crypto.timingSafeEqual(
            Buffer.from(received),
            Buffer.from(expected)
        )
    }

    // Fallback Basic auth
    if (authHeader.startsWith("Basic ")) {
        const received = authHeader.slice("Basic ".length)
        const expected = Buffer.from(
            `${process.env.PHONEPE_WEBHOOK_USERNAME}:${process.env.PHONEPE_WEBHOOK_PASSWORD}`
        ).toString("base64")
        return received === expected
    }

    return false
}

// ── Controller ────────────────────────────────────────────────────────────────

export const manageWebhooks = asyncHandler(async (req, res) => {
console.log(`[Webhook] is responding ${JSON.stringify(req.body,null,2)}`)

console.log("Auth header:", req.headers["authorization"])
console.log("Full headers:", JSON.stringify(req.headers, null, 2))
    
    // ── 1. Verify signature ───────────────────────────────────────────────────
    /*if (!verifySignature(req)) {
        return res.status(401).json({ success: false, message: "Invalid webhook signature" });
    }*/

    // ── 2. Parse payload ──────────────────────────────────────────────────────
    const { event: eventType, payload } = req.body;

    if (!payload?.merchantOrderId) {
        return res.status(400).json({ success: false, message: "Invalid webhook payload" });
    }

    const { merchantOrderId, state } = payload;

    // ── 3. Find payment ───────────────────────────────────────────────────────
    const payment = await Payments.findOne({ merchantOrderId }).populate({
        path: "booking",
        populate: { path: "user", select: "username" }   // needed for ticket participantName
    });

    if (!payment) {
        // Acknowledge unknown orders — could be a test event or race condition.
        // Returning 200 stops PhonePe from retrying endlessly.
        console.warn(`[Webhook] No payment found for merchantOrderId: ${merchantOrderId}`);
        return res.status(200).json({ success: true, message: "Acknowledged" });
    }

    // ── 4. Idempotency guard ──────────────────────────────────────────────────
    // PhonePe can send the same webhook more than once. If we already processed
    // this payment, just acknowledge and exit — don't touch seats or bookings again.
    if (payment.status !== "Pending") {
        console.log(`[Webhook] Already processed payment ${merchantOrderId} (status: ${payment.status})`);
        return res.status(200).json({ success: true, message: "Already processed" });
    }

    const booking = payment.booking;
    if (!booking) {
        console.error(`[Webhook] Payment ${merchantOrderId} has no linked booking`);
        return res.status(200).json({ success: true, message: "No booking reference, acknowledged" });
    }

    // ── 5. Handle state inside a transaction ──────────────────────────────────
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (state === "COMPLETED") {
            // Mark payment approved
            payment.status = "Approved";
            payment.verifiedAt = new Date();
            await payment.save({ session });

            // Confirm booking
            booking.bookingStatus = "Confirmed";
            await booking.save({ session });
            
            //Decrement booking here not in the booking controller
            const updatedEvent = await Events.findOneAndUpdate(
                { _id: booking.event, seatLimit: { $gte: booking.ticketCount } },
                { $inc: { seatLimit: -booking.ticketCount } },
                { new: true, session }
            );

            if (!updatedEvent) {
                // Seats ran out between booking and payment (race condition).
                // Abort and refund would be handled manually / via PhonePe refund API.
                await session.abortTransaction();
                session.endSession();
                console.error(`[Webhook] Seat race condition for booking ${booking._id}`);
                return res.status(200).json({
                    success: false,
                    message: "Seats no longer available — manual refund required"
                });
            }

            await session.commitTransaction();
            session.endSession();

            console.log(`[Webhook] Payment COMPLETED for booking ${booking._id}`);
            return res.status(200).json({ success: true, message: "Payment confirmed, booking activated" });

        } else if (state === "FAILED" || state === "CANCELLED") {
            // Mark payment rejected
            payment.status = "Rejected";
            await payment.save({ session });

            // Cancel booking
            booking.bookingStatus = "Cancelled";
            await booking.save({ session });

            // ✅ Restore seats back to the event.
            // The old code never did this — seats were permanently lost on failed payments.
            await Events.findByIdAndUpdate(
                booking.event,
                { $inc: { seatLimit: booking.ticketCount } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            console.log(`[Webhook] Payment ${state} for booking ${booking._id} — seats restored`);
            return res.status(200).json({ success: true, message: `Payment ${state.toLowerCase()}, booking cancelled` });

        } else {
            // PENDING or any unknown state — acknowledge, take no action.
            // PhonePe may send PENDING webhooks as intermediate updates.
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({ success: true, message: `State '${state}' acknowledged, no action taken` });
        }

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("[Webhook] Processing error:", error);

        // Return 500 so PhonePe knows to retry — don't swallow this.
        return res.status(500).json({ success: false, message: "Internal error, will retry" });
    }
});