import { Bookings } from '../../models/booking.model.js'

export const changeBookingStatus = async(bookingId,status)=>{

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
   
   await booking.save();
}