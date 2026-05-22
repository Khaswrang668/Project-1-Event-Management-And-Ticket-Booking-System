import { Events } from "../../models/event.model.js";
import { Users } from "../../models/user.model.js";
import { asyncHandler } from '../../utils/asyncHandler.js';
import bcrypt from 'bcrypt';

export const getPendingEvents = asyncHandler(async (req,res)=>{
    //This controller only returns list of pending events to admin
    //verifies if the person trying to access is admin
    //i.e. event.adminApproval = false

    const userId = req.params._id;
    
    //verify if the user is admin
    const user = await Users.findById(userId);
    
    if(!user){
        return res.status(404).json({
            success: true,
            message: "User not found"
        })
    }

    if(user.role != "Admin"){
        return res.status(404).json({
            success: false,
            message: "The user is not an Admin"
        })
    }
    
    const pendingEvents = await Events.find({adminApproval: false});

    //send a list of pending events 
    res.status(200).json({
        success: false,
        message: "successfully fetched pending events from backend",
        body: pendingEvents
    })

})

export const approveEvent = asyncHandler(async(req,res)=>{
    //This controller approves event from the pending event list of admin

    const {userId,eventId} = req.body;

    const user = await Users.findById(userId);
    const event = await Events.findById(eventId);

    if(!user){
        return res.status(404).json({
            success: false,
            message: "user not found"
        })
    }
    
    if(user.role != "Admin"){
        return res.status(404).json({
            success: false,
            message: "user is not admin"
        })
    }
     
    if(!event){
        return res.status(404).json({
            success: false,
            message: "event is not found"
        })
    }

    event.adminApproval = true;

    await event.save();
    
    res.status(200).json({
        success: true,
        message: "Event is approved successfully"
    })
})