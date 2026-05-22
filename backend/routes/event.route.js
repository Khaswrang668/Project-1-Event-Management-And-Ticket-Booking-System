import { Router } from "express";

import { browseAndFilter } from "../controllers/Events/browseAndFilter.event.controller.js";
import { createEvents } from "../controllers/Events/createEvents.controller.js";
import { deleteEvents } from "../controllers/Events/deleteEvents.controller.js";
import { updateEvents } from "../controllers/Events/updateEvents.controller.js"; 

import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router()

router.route('/browse-events').get(verifyJWT,browseAndFilter);
router.route('/create-event').post(verifyJWT,createEvents);
router.route('/:id/delete-event').delete(verifyJWT,deleteEvents);
router.route('/:id/update-event').patch(verifyJWT,updateEvents);

export default router