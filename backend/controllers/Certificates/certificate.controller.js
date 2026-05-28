import { Attendances } from "../../models/attendance.model.js";
import { Tickets } from "../../models/ticket.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { randomUUID } from 'crypto';
import { generateCertificate } from "./generateCertificate.js";
import nodemailer, { createTransport } from "nodemailer";
import { Users } from "../../models/user.model.js";
import "dotenv/config"

export const certificateController = asyncHandler(async (req, res) => {
    const ticketId = req.params.ticketId;
    const userId = req.user._id;//Fix: The user is the organizer in this case

    console.log(`This controller is responding certificate generator ${req.params.ticketId}`)

    // 1. Find ticket
    const ticket = await Tickets.findById(ticketId)
        .populate({ path: 'booking', populate: { path: 'user', select: 'username email' } })
    
    const organizer = await Users.findById(userId);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: "Ticket doesn't exist"
        })
    }

    // 2. Check checked in
    if (!ticket.isCheckedIn) {
        return res.status(400).json({
            success: false,
            message: "User has not checked in"
        })
    }

    // 3. Find attendance
    /*const attendance = await Attendances.findOne({ticket: ticketId})
    
    if(!attendence){
        return res.status(404).json({
            success: false,
            message: "Attendence record doesn't exist"
        })
    }

    // 4. Check valid scan
    if (attendance.scanResult === "invalid") {
        return res.status(400).json({
            success: false,
            message: "Invalid scan result"
        })
    }*/

    // 5. Generate certificate PDF
    const certificateId = randomUUID()
    const certificatePdf = await generateCertificate(
        certificateId,
        ticketId,
        ticket.booking._id
    )

    console.log(ticket.booking.user.email)

    // 6. Send email with PDF attachment in background
    // Don't await — respond to client immediately, email sends async
    sendMail({
        from: organizer.email,
        to: ticket.booking.user.email,
        subject: 'Your Certificate of Participation — EventFlow',
        html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
                <h2 style="color:#6d28d9">Congratulations! 🎓</h2>
                <p>Hi ${ticket.booking.user.username},</p>
                <p>Thank you for attending the event. Please find your 
                   <strong>Certificate of Participation</strong> attached to this email.</p>
                <p style="color:#999;font-size:12px;margin-top:24px">
                    Certificate ID: ${certificateId}
                </p>
                <p style="color:#999;font-size:12px">EventFlow — Event Management System</p>
            </div>
        `,
        attachments: [
            {
                filename: `certificate-${certificateId}.pdf`,
                content: certificatePdf,
                contentType: 'application/pdf'
            }
        ]
    })

    // 7. Respond immediately — don't wait for email
    res.status(200).json({
        success: true,
        message: "Certificate generated and sent to your email",
        data: {
            certificateId,
            sentTo: ticket.booking.user.email
        }
    })
})


const sendMail = async ({ from, to, subject, html, attachments = [] }) => {
  const transporter= await createTransport({
      "service": "gmail",
      "auth": {
        user: `${process.env.APP_MAIL}`,
        pass: `${process.env.APP_GOOGLE_PASSWORD}`
      }
  })

  try {
    await transporter.sendMail({
      from: `"EventFlow" <${process.env.APP_MAIL}>`,
      to,
      subject,
      html,
      attachments // nodemailer handles this natively
    })
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error('Email error:', error.message)
  }
}

//Fixed issues: transporter was undefined , added it using createTransporter method
//Then got the passowords for gmail app access via accounts.google 
//removed the attendece checking