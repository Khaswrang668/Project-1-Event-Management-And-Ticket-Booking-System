import mongoose from 'mongoose'

const attendenceSchema = new mongoose.Schema({
    ticket:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    scanTime:{
        type: Date,
        default: Date.now
    },
    scanResult:{
        type: String,
        enum: ['valid','invalid'],
        required: true,
        default: 'Invalid'
    }
},{timestamps: true})

export const Attendences = mongoose.model('Attendences',attendenceSchema)