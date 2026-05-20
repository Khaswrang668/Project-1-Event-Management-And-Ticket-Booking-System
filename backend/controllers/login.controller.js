import asyncHandler from './utils/asyncHandler.js'
import { Users } from './models/user.model.js'
import bcrypt from 'bcrypt'

export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email or password is missing"
    })
  }

  const user = await Users.findOne({ email })

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User doesn't exist"
    })
  }

  const verified = await bcrypt.compare(password, user.password)

  if (!verified) {
    return res.status(401).json({
      success: false,
      message: "Wrong password"
    })
  }

  return res.status(200).json({
    success: true,
    message: "User login successful",
    body: {
      _id: user._id,
      email: user.email,
      role: user.role
    }
  })
})
