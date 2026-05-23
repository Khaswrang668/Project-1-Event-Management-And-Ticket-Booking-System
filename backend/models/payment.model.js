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
    status:{
        type: String,
        enum: ['Pending','Approved','Rejected'],
        default: 'Pending',
        required: true
    },
    merchantOrderId:{
        type: String
    },
    amount:{
        type: Number
    }
},{timestamps: true})

export const Payments = mongoose.model('Payments',paymentSchema)