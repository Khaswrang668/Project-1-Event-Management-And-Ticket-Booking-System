import { Users } from '../../models/user.model.js'
import bcrypt from 'bcrypt'
import { asyncHandler } from '../../utils/asyncHandler.js'
import nodemailer,{createTransport} from "nodemailer";
import "dotenv/config";

export const signUp = asyncHandler(async (req, res) => {
  const { username, email, password, phone , role} = req.body

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
  
  if(password.length < 8){
    return res.status(404).json({
      success: false,
      message: "The password must be atleast 8 carachters"
    })
  }
  
  const hashedPassword = await bcrypt.hash(password,10)
  
  const user = await Users.create({
    username,
    email,
    password: hashedPassword,
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

export const signUpAsAdmin = asyncHandler(async(req,res)=>{
  const { username, email, password, phone } = req.body

  if (!username || !email || !password || !phone ) {
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
  
  if(password.length < 8){
    return res.status(404).json({
      success: false,
      message: "The password must be atleast 8 carachters"
    })
  }
  
  const hashedPassword = await bcrypt.hash(password,10)
  
  const user = await Users.create({
    username,
    email,
    password: hashedPassword,
    phone,
    role: 'Admin',
    status: 'Pending'
  })

  sendRequest({
      from: email,
      subject: 'Admin registration verification request to principal admin',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Admin Signup Request</h2>
        <p>A new user has requested registration as admin and access to the admin platform.</p>
      <hr />

        <h3>User Details</h3>

        <p><strong>Name:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        
        <br />
      
      <a href="${process.env.BACKEND_URL}/api/v1/users/${user._id}/approve-admin-registration"
        style="
        background-color: green;
        color: white;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 6px;
        margin-right: 10px;
        display: inline-block;
    "
      >
      Approve
    </a>

    <a href="${process.env.BACKEND_URL}/api/v1/users/${user._id}/reject-admin-registration"
    style="
      background-color: red;
      color: white;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 6px;
      display: inline-block;
    ">

    Reject
    </a>
  </div>
      `
  })

  res.status(200).json({
      success: true,
      message: 'Admin registration request sent to the system successfully'
  })
})

const sendRequest = async ({ from, subject, html, attachments = [] }) => {
  const transporter= await createTransport({
      "service": "gmail",
      "auth": {
        user: `${process.env.APP_MAIL}`,
        pass: `${process.env.APP_GOOGLE_PASSWORD}`
      }
  })

  try {
    await transporter.sendMail({
      from,
      to: `${process.env.APP_MAIL}`,
      subject,
      html
    })
    console.log(`Email sent to ${process.env.APP_MAIL}`)
  } catch (error) {
    console.error('Email error:', error.message)
  }
}
