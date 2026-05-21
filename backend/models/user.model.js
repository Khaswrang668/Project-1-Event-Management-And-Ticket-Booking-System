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
},
refreshToken:{
    type: String
}
},{timestamps: true})

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Users = mongoose.model('Users',userSchema)
