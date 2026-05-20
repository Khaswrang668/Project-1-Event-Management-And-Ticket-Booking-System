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
        const payment = new Payments.create({
            booking: bookingId,
            paymentMethod: paymentMethod,
            verifiedAt: Date.now,
            status: 'Pending'
        });
        
        const paymentResponse = await paymentRequest(
            updatedEvent.price * ticketCount
        );

        await payment.save({ session });
        
        // 4. Commit DB transaction FIRST
        await session.commitTransaction();
        session.endSession();
        
        
        //3.Update booking status if payment was successful
        if(paymentResponse) changeBookingStatus(bookingId,'Confirmed')

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