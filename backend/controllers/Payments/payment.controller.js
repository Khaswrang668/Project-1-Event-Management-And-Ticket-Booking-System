import { asyncHandler } from '../../utils/asyncHandler.js'
import { Bookings } from '../../models/booking.model.js'
import { Payments } from '../../models/payment.model.js'
import { Events } from '../../models/event.model.js'
import { changeBookingStatus } from '../Bookings/bookingStatus.update.js'
import { paymentRequest } from './paymentRequest.js'

import mongoose from 'mongoose'
import "dotenv/config"

export const createPaymentRecord = asyncHandler(async (req, res) => {
    const { eventId, bookingId , ticketCount, paymentMethod } = req.body;
    const userId = req.user._id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const event = await Events.findById(eventId)
        
        //1.Check if event exists and the seats are available
        if (!event || event.seatLimit < ticketCount) {
            throw new Error("Not enough tickets available or event not found");
        }
        
        //2.Create a payment object
        const payment = await Payments.create({
            booking: bookingId,
            paymentMethod: paymentMethod,
            verifiedAt: Date.now(),
            status: 'Pending'
        }, { session });
        
        const paymentResponse = await paymentRequest(
            event.price * ticketCount
        );
        
        //3.Update booking status if payment was successful
        if(paymentResponse) await changeBookingStatus(bookingId,'Confirmed')

        // 4. Commit DB transaction FIRST
        await session.commitTransaction();
        session.endSession();
        

        const redirectUrl = paymentResponse.redirectUrl;
        const merchantOrderId = paymentResponse.merchantOrderId;

        // 6. Send response
        res.status(201).json({
            success: true,
            message: "Payment initiated",
            paymentUrl: redirectUrl,
            merchantOrderId: merchantOrderId,
            data: payment
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});