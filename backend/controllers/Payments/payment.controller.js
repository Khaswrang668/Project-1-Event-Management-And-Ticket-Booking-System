import { asyncHandler } from '../../utils/asyncHandler.js'
import { Bookings } from '../../models/booking.model.js'
import { Payments } from '../../models/payment.model.js'
import { Events } from '../../models/event.model.js'
import { changeBookingStatus } from '../Bookings/bookingStatus.update.js'
import { paymentRequest } from './paymentRequest.js'

import mongoose from 'mongoose'
import "dotenv/config"

export const createPaymentRecord = asyncHandler(async (req, res) => {
    const { ticketCount, paymentMethod } = req.body;
    const eventId = req.params.eventId;
    const userId = req.user._id;
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
    const event = await Events.findById(eventId,null,{session})
        
    //1.Check if event exists and the seats are available
    if (!event || event.seatLimit < ticketCount) {
        throw new Error("Not enough tickets available or event not found");
    }
    
    //2.Find the booking that actually belongs to the user of that one event 
    const booking = await Bookings.findOne({user: userId,event: eventId},null,{session});

    if(!booking){
       await session.abortTransaction();
       session.endSession();
       
       return res.status(404).json({
        success: false,
        message: "No booking record found for this user"
       })
    }

    //3.Intialize the payment gateway
    const paymentResponse = await paymentRequest(
        event.price * ticketCount
    );
    
    //4.URLs of the payment gateway to be sent to frontend
    const redirectUrl = paymentResponse.redirectUrl;
    const merchantOrderId = paymentResponse.merchantOrderId;
    
    //5.Create a temporaray payment object with pending status
    const payment = await Payments.create([{
        booking: booking._id,
        paymentMethod: paymentMethod,
        status: 'Pending',
        merchantOrderId: merchantOrderId,
        amount: event.price*ticketCount
    }],{session});

    await session.commitTransaction();
    session.endSession();

    // 6. Send response
    res.status(200).json({
        success: true,
        message: "Payment initiated",
        paymentUrl: redirectUrl,
        merchantOrderId: merchantOrderId,
        data: payment
    });

    }
    catch(error){
       await session.abortTransaction();
       session.endSession();

       console.log(`Error in payment gateway intialization ${error}`)

       throw new Error(`Error in payment gateway intialization ${error}`)
    }
});


//Changes made:-
//removed verifiedAt->should be done after webhook success confirmation
//Used booking found by only req.user._id not the client suppilied bookingId
//added merchentOrderId in payment schema and payment.create(very important for webhook)
//added session and transaction for rollbackn in case of payment failure
//added booking and event changes in rollback too for data consistency