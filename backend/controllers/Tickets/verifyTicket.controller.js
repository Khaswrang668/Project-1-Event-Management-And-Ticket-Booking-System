import { Tickets } from "../../models/ticket.model.js";
import { Attendences } from "../../models/attendence.model.js";
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

    if(isCheckedIn){
        return res.status(404).json({
            success: false,
            message: "Tikcet is already used"
        })
    }

    ticket.isCheckedIn = true;
    ticket.isCheckedInAt = Date.now();

    //create an attendence log
    const attendence = await Attendences.create({
        ticket: ticket._id,
        scanTime: ticket.isCheckedInAt,
        scantResult: 'Valid'
    })

    await ticket.save();

    res.status(200).json({
        success: true,
        message: 'Ticket exsits and it is valid',
        data: ticket
    })
})