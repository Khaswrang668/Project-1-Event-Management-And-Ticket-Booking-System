import { Attendances } from "../../models/attendance.model.js";
import { Tickets } from "../../models/ticket.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getEligibleParticipants = asyncHandler(async (req, res) => {
    const { eventId } = req.params
    console.log(`This get eligible users controller is working ${eventId}`)

    // 1. Find all checked-in tickets for this event
    const tickets = await Tickets.find({
        event: eventId,
        isCheckedIn: true
    }).populate({
        path: 'booking',
        populate: { path: 'user', select: 'username email' }
    })

    if (!tickets.length) {
        return res.status(404).json({
            success: false,
            message: "No eligible participants found"
        })
    }

    // 2. Find valid attendance records for these tickets
    const ticketIds = tickets.map(t => t._id)

    const validAttendances = await Attendances.find({
        ticket: { $in: ticketIds },
        scanResult: 'valid'
    })

    if (!validAttendances.length) {
        return res.status(404).json({
            success: false,
            message: "No valid attendance records found"
        })
    }

    // 3. Match tickets with their attendance records
    const eligible = tickets
        .map(ticket => {
            const attendance = validAttendances.find(
                a => a.ticket.toString() === ticket._id.toString()
            )
            if (!attendance) return null

            return {
                ticketId: ticket._id,
                attendanceId: attendance._id,
                participantName: ticket.booking?.user?.username || 'Unknown',
                email: ticket.booking?.user?.email || null,
                checkedInAt: ticket.isCheckedInAt
            }
        })
        .filter(Boolean)

    if (!eligible.length) {
        return res.status(404).json({
            success: false,
            message: "No eligible participants found"
        })
    }

    res.status(200).json({
        success: true,
        message: `${eligible.length} eligible participant(s) found`,
        data: eligible
    })
})