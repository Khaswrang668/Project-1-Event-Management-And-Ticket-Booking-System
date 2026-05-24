import { Attendances } from "../../models/attendance.model.js";
import { Tickets } from "../../models/ticket.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { randomUUID } from 'crypto';
import { generateCertificate } from "./generateCertificate.js";

export const certificateController = asyncHandler(async (req,res)=>{
    const {ticketId,attendanceId} = req.body;

    const ticket = await Tickets.findById(ticketId).populate('booking');

    if(!ticket){
        return res.status(404).json({
            success: false,
            message: "Ticket doesn't exist in databases"
        })
    }
    
    if(!ticket.isCheckedIn){
        return res.status(404).json({
            success: false,
            message: 'The user is not checked in'
        })
    }
    
    const attendance = await Attendances.findById(attendanceId);
    if(!attendance){
        return res.status(404).json({
            success: false,
            message: "No attendence records found in databases"
        })
    }
    
    if(attendance.scanResult === "invalid"){
        return res.status(404).json({
            success: false,
            message: 'Invalid scan results of ticket'
        })
    }

    //generate certificate Id
    const certificateId = randomUUID();

    //service for genearating downloadable certificate pdf
    const certificatePdf = await generateCertificate(certificateId,ticketId,ticket.booking._id);
    
    res.set({
        "Content-type": "application/pdf",
        "Content-Disposition": `inline; filename=certificate.${certificateId}.pdf`,
        "Content-Length": certificatePdf.length
    });

    res.send(certificatePdf);
})
