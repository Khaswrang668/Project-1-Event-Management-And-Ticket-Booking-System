import mongoose from 'mongoose'

const paymentSchema = mongoose.model({
    booking:{
        type: mongoose.Types.Schema.ObjectId,
        ref: "Bookings"
    },
    paymentMethod:{
        type: String,
        enum:['UPI','Cash','Card'],
        required: true
    },
    VerifiedAt:{
        type: Date,
    },
    Status:{
        type: String,
        enum: ['Pending','Approved','Rejected'],
        default: 'Pending',
        required: true
    }
},{timestamps: true})

export const Payments = mongoose.model('Payments',paymentSchema)