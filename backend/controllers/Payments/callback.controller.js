//The callback only shows payment success or failures as verified by the webhook
//The callback in frontend has back button to go back to event page where he can download ticket now
import { asyncHandler } from "../../utils/asyncHandler.js"
import { Bookings } from "../../models/booking.model.js"
import { Payments } from "../../models/payment.model.js"

export const handleCallBack = asyncHandler(async (req, res) => {
    const { merchantOrderId } = req.query
    console.log("Handle callback:", merchantOrderId);

    if (!merchantOrderId) {
        return res.status(400).json({ success: false, message: "merchantOrderId missing" })
    }

    const payment = await Payments.findOne({ merchantOrderId })
    console.log("Payment:",payment)

    if (!payment) {
        return res.status(404).json({ success: false, message: "Payment record not found" })
    }

    const booking = await Bookings.findById(payment.booking)
    console.log("Booking:",booking)
    
    if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" })
    }

    res.status(200).json({
        success: true,
        message: "Status fetched successfully",
        data: {
            "booking-status": booking.bookingStatus,
            "payment-status": payment.status,
            "merchantOrderId": merchantOrderId
        }
    })
})