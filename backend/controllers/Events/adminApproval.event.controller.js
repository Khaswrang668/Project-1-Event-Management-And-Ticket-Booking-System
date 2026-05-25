import { Events } from "../../models/event.model.js";
import { Users } from "../../models/user.model.js";
import { asyncHandler } from '../../utils/asyncHandler.js';
import bcrypt from 'bcrypt';

export const getPendingEvents = asyncHandler(async (req,res)=>{
    
    if(req.user.role !== "Admin"){
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

    const userId = req.user._id;
    const eventId = req.params.eventId;
    
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

export const rejectEvent = asyncHandler(async(req,res)=>{
    //This controller approves event from the pending event list of admin

    const userId = req.user._id;
    const eventId = req.params.eventId;
    
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

    event.adminApproval = false;

    await event.save();
    
    res.status(200).json({
        success: true,
        message: "Event is disappproved successfully"
    })
})