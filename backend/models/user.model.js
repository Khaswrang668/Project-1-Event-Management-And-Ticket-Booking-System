import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
username:{
    type: String,
    required: true
},
email:{
  type: String,
  required: true,
  unique: true
},
password:{
   type: String,
   required: true
},
phone:{
    type: Number,
    required: true,
    length: 10
},
role:{
    type: String,
    enum:['User','Organizer','Admin'],
    required: true
}
},{timestamps: true})

export const Users = mongoose.model('Users',userSchema)