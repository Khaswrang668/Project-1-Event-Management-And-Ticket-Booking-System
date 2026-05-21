import { Tickets } from "../../models/ticket.model.js";
import { Attendances } from "../../models/attendance.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const verifyTicket = asyncHandler(async(req,res)=>{
    const qrToken = req.body.ticketId;

    //search ticket object by it's ID in DB
    const ticket = await Tickets.findOne({qrToken});
    
    //If ticket doesn't exists 
    if(!ticket){
        return res.status(404).json({
            success: false,
            message: 'Invalid ticket'
        })
    }

    /*if(ticket.isCheckedIn){
        return res.status(404).json({
            success: false,
            message: "Tikcet is already used"
        })
    } -> actually keep it simple tbh. isCheckedIn is false by default in
      the Schema but gets updatd to true when ticket is verified*/

    ticket.isCheckedIn = true;
    ticket.isCheckedInAt = Date.now();

    //create an attendence log
    const attendance = await Attendances.create({
        ticket: ticket._id,
        scanTime: ticket.isCheckedInAt,
        scanResult: 'Valid'
    })

    await ticket.save();

    res.status(200).json({
        success: true,
        message: 'Ticket exsits and it is valid',
        data: ticket
    })
})