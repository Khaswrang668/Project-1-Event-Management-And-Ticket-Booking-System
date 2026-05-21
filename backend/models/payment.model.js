import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    booking:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bookings"
    },
    paymentMethod:{
        type: String,
        enum:['UPI','Cash','Card'],
        required: true
    },
    verifiedAt:{
        type: Date
    },
    Status:{
        type: String,
        enum: ['Pending','Approved','Rejected'],
        default: 'Pending',
        required: true
    }
},{timestamps: true})

export const Payments = mongoose.model('Payments',paymentSchema)