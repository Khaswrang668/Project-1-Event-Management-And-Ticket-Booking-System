import { Users } from "../../models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const approveAdminRegistration = asyncHandler(async(req,res)=>{
    const userId = req.params.id;
    console.log(`The approve admin registration req is working`)
    const user = await Users.findById(userId);

    if(!user){
        return user.status(404).json({success: false, message: 'User doesnot exist'})
    }

    user.status = "Approved";
    await user.save();
    console.log(`USER STATUS ${user.status}`)
    res.status(200).json({
        success: true,
        message: 'User is verified and successfully registered as admin'
    })
})

export const rejectAdminRegistration = asyncHandler(async(req,res)=>{
    const userId = req.params.id;

    const user = await Users.findById(userId);

    if(!user){
        return user.status(404).json({success: false, message: 'User doesnot exist'})
    }

    user.status = "Rejected";

    await user.save();

    res.status(200).json({
        success: true,
        message: 'We are sorry to inform your admin registration application has been rejected, one of the reasons: suspicious user credentials or admins vacancy is full'
    })
})