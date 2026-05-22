import { Router } from "express";

import { browseAndFilter } from "../controllers/Events/browseAndFilter.event.controller.js";
import { createEvents } from "../controllers/Events/createEvents.controller.js";
import { deleteEvents } from "../controllers/Events/deleteEvents.controller.js";
import { updateEvents } from "../controllers/Events/updateEvents.controller.js"; 
import { getPendingEvents } from "../controllers/Events/adminApproval.event.controller.js";
import { approveEvent } from "../controllers/Events/adminApproval.event.controller.js";

import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router()

router.route('/browse-events').get(verifyJWT,browseAndFilter);
router.route('/create-event').post(verifyJWT,createEvents);
router.route('/:id/delete-event').delete(verifyJWT,deleteEvents);
router.route('/:id/update-event').patch(verifyJWT,updateEvents);
router.route('/:id/get-pending-events').get(verifyJWT,getPendingEvents);
router.route('/approve-event').post(verifyJWT,approveEvent);

export default router