import { asyncHandler } from "../../utils/asyncHandler.js";
import { Bookings } from "../../models/booking.model.js";

export const getMyBookingHistory = asyncHandler(async(req,res)=>{
    const userId = req.user._id

    const book = await Bookings.find({user: userId});
    
    if(!book.length){
        return res.status(404).json({
            success: false,
            message: "No bookings found"
        })
    }

    res.status(200).json({
        success: true,
        message: "Booking history successfully fetched",
        data: book
    })
})