import { Events } from '../../models/event.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const deleteEvents = asyncHandler(async (req, res) => {
    const eventId = req.body._id || req.params.id;
    const userId = req.user._id
    
    const user = await Users.findById(userId);
    
    if(user.role !== 'Organizer' || user.role !== 'Admin'){
        return res.status(404).json({message: "Not allowed to delete the event"})
    }
    
    if (!eventId) {
        return res.status(400).json({ message: "Event ID is required" });
    }

    const deletedDocument = await Events.findByIdAndDelete(eventId);

    if (!deletedDocument) {
        return res.status(404).json({ message: "Event not found; nothing was deleted" });
    }

    res.status(200).json({
        success: true,
        message: "Event deleted successfully",
        data: deletedDocument
    });
});