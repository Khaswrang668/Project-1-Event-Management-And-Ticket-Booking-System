import { resolveSoa } from "dns";
import { Attendences } from "../../models/attendence.model";
import { Tickets } from "../../models/ticket.model";
import { asyncHandler } from "../../utils/asyncHandler";
import randomUUID from 'crypto';

export const certificateController = asyncHandler(async (req,res)=>{
    const {ticketId,attendenceId} = req.body;

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
    
    const attendence = await Attendences.findById(attendenceId);
    if(!attendence){
        return res.status(404).json({
            success: false,
            message: "No attendence records found in databases"
        })
    }
    
    if(attendence.scanResult == "Invalid"){
        return res.status(404).json({
            success: false,
            message: 'Invalid scan results of ticket'
        })
    }

    //generate certificate Id
    const certificateId = randomUUID();

    //service for genearating downloadable certificate pdf
    const certificatePdf = generateCertificate(certificateId,ticketId,ticket.booking._id);
    
    res.set({
        "Content-type": "application/pdf",
        "Content-Disposition": `inline; filename=certificate.${certificateId}.pdf`,
        "Content-Length": certificatePdf.length
    });

    res.send(certificatePdf);
})
