import { asyncHandler } from "../../utils/asyncHandler.js";
import { Payments } from "../../models/payment.model.js";
import { Bookings } from "../../models/booking.model.js";
import { Events } from "../../models/event.model.js";
import { changeBookingStatus } from "../Bookings/bookingStatus.update.js";
import mongoose from "mongoose";
import crypto from "crypto";

/**
 * PhonePe Webhook Handler
 * POST /api/payments/webhook
 * 
 * PhonePe sends a webhook with:
 * - authorization header (username:password base64, or HMAC-SHA256 signature)
 * - body: { event, payload: { merchantOrderId, state, ... } }
 */
export const manageWebhooks = asyncHandler(async (req, res) => {
    // ── 1. Verify PhonePe webhook signature ────────────────────────────────
    const authHeader = req.headers["authorization"] || "";

    // PhonePe signs webhooks: "SHA256/<base64-hmac>"
    if (authHeader.startsWith("SHA256/")) {
        const receivedSignature = authHeader.replace("SHA256/", "");
        const rawBody = JSON.stringify(req.body); // use raw body if you have it; else re-stringify
        const expectedSignature = crypto
            .createHmac("sha256", process.env.PHONEPE_WEBHOOK_SECRET)
            .update(rawBody)
            .digest("base64");

        if (receivedSignature !== expectedSignature) {
            return res.status(401).json({ success: false, message: "Invalid webhook signature" });
        }
    } else {
        // Fallback: basic auth check (username:password from PhonePe dashboard)
        const expectedBasic = Buffer.from(
            `${process.env.PHONEPE_WEBHOOK_USERNAME}:${process.env.PHONEPE_WEBHOOK_PASSWORD}`
        ).toString("base64");
        const receivedBasic = authHeader.replace("Basic ", "");
        if (receivedBasic !== expectedBasic) {
            return res.status(401).json({ success: false, message: "Unauthorized webhook" });
        }
    }

    // ── 2. Parse event payload ──────────────────────────────────────────────
    const { event: eventType, payload } = req.body;

    if (!payload || !payload.merchantOrderId) {
        return res.status(400).json({ success: false, message: "Invalid webhook payload" });
    }

    const { merchantOrderId, state } = payload;

    // ── 3. Find the payment by merchantOrderId ──────────────────────────────
    const payment = await Payments.findOne({ merchantOrderId }).populate("booking");

    if (!payment) {
        // Acknowledge to PhonePe even if we don't recognise the order,
        // so it stops retrying (could be a test event or race condition)
        console.warn(`Webhook: no payment found for merchantOrderId ${merchantOrderId}`);
        return res.status(200).json({ success: true, message: "Acknowledged" });
    }

    // Guard against replaying an already-processed webhook
    if (payment.status !== "Pending") {
        return res.status(200).json({ success: true, message: "Already processed" });
    }

    const booking = payment.booking;
    if (!booking) {
        return res.status(200).json({ success: true, message: "Booking reference missing, acknowledged" });
    }

    // ── 4. Map PhonePe state → internal status ──────────────────────────────
    // PhonePe v2 states: COMPLETED, FAILED, PENDING, CANCELLED
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (state === "COMPLETED") {
            // Mark payment approved
            payment.status = "Approved";
            payment.verifiedAt = new Date();
            await payment.save({ session });

            // Confirm the booking
            await changeBookingStatus(booking._id, "Confirmed");

            // Decrement seat count on the event
            await Events.findByIdAndUpdate(
                booking.event,
                { $inc: { seatLimit: -booking.ticketCount } },
                { session }
            );

        } else if (state === "FAILED" || state === "CANCELLED") {
            // Mark payment rejected
            payment.status = "Rejected";
            await payment.save({ session });

            // Cancel the booking
            await changeBookingStatus(booking._id, "Cancelled");

        } else {
            // PENDING or unknown — just acknowledge, nothing to change yet
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json({ success: true, message: `State ${state} acknowledged, no action taken` });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ success: true, message: "Webhook processed" });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Webhook processing error:", error);
        // Return 500 so PhonePe retries
        return res.status(500).json({ success: false, message: "Webhook processing failed" });
    }
});