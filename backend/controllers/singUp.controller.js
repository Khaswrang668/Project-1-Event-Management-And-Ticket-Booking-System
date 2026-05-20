import { Users } from './models/user.model.js'
import bcrypt from 'bcrypt'
import asyncHandler from './utils/asyncHandler.js'

export const signUp = asyncHandler(async (req, res) => {
  const { username, email, password, phone, role } = req.body

  if (!username || !email || !password || !phone || !role) {
    return res.status(400).json({
      success: false,
      message: "Some fields are missing"
    })
  }

  const existingUser = await Users.findOne({ email })

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "User already exists"
    })
  }
  
  const hashedPassword = await bcrypt.hash(password,10)
  
  const user = await Users.create({
    username,
    email,
    hashedPassword,
    phone,
    role
  })

  return res.status(201).json({
    success: true,
    message: "User has been created",
    body: {
      _id: user._id,
      username: user.username,
      email: user.email
    }
  })
})
