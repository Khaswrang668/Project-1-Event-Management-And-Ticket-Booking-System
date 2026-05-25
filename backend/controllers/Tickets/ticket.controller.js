import { Tickets } from "../../models/ticket.model.js";
import { Bookings } from "../../models/booking.model.js";
import { Events } from "../../models/event.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { generateTicketPDF } from "./generateTicket.js";
import { randomUUID } from "crypto";

export const generateTicket = asyncHandler(async (req,res)=>{
    const eventId = req.params.eventId;
    const bookingId = req.params.bookingId;
    
    //1.find the booking object from DB
    const booking = await Bookings.findById(bookingId).populate('user');
    
    //2.verify booking's existence
    if(!booking){
        return res.status(404).json({
            success: false,
            message: "Booking doesn't exists"
        })
    }
    
    //3.Verify booking status -> confirmed
    if(booking.bookingStatus != 'Confirmed'){
        return res.status(404).json({
            success: false,
            message: "Booking is not confirmed"
        })
    }

    //4.Check event existence in DB
    const event = await Events.findById(eventId);
    if(!event) {
        return res.status(404).json({
            success: false,
            message: "no event found"
        })
    }

    const qrToken = randomUUID();

    //4.create a ticket object
    const ticket = await Tickets.create({
        booking: booking,
        event: event,
        participantName: booking.user.username,
        qrToken: qrToken,
        isCheckedIn: false
    })

    //insert here actual ticket PDF generation logic here later
    const pdfData =  await generateTicketPDF(ticket._id,eventId,qrToken);
    
    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=ticket.pdf",
        "Content-Length": pdfData.length
    });
    
    //So pdfData is a Promise object, not a Buffer. pdfData.length will be undefined and res.send
    // (pdfData) will send nothing useful. Add await.
    
    //send res back to user
    res.send(pdfData);
});

export const getTicketData = asyncHandler(async (req,res)=>{
    const ticketId = req.body.ticketId;

    const ticket = await Tickets.findById(ticketId);
    
    //Check ticket's existence
    if(!ticket){
        return res.status(404).json({
            success: false,
            message: "Ticket doesn't exists"
        })
    }

    const event = await Events.findById(ticket.event);
    
    //Check if ticket has expired yet
    if(event.endTime < Date.now()){
        return res.status(404).json({
            success: false,
            message: "Ticket has expired"
        })
    }

    res.status(200).json({
        success: true,
        message: "Ticket found successfully",
        data: ticket
    })
})