import { Bookings } from '../../models/booking.model.js'

export const changeBookingStatus = asyncHandler( async(bookingId,status)=>{

   if(status != 'Pending' && status!= 'Cancelled' && status!= 'Confirmed'){
    return res.status(404).json({
        success: false,
        message: "Invalid status"
    })
   }
   
   const booking = await Bookings.findById(bookingId);

   if(!booking){
    return res.status(404).json({
        success: false,
        message: "No booking found"
    })
   }
   
   await Bookings.updateOne(
    { _id: bookingId},
    { $set: {bookingStatus: status}}
   )
   
   await Bookings.save();
   
   res.status(200).json({
    success: true,
    message: "Booking status successfully updated"
   })
})