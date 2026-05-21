import { Router } from "express";

import { browseAndFilter } from "../controllers/Events/browseAndFilter.event.controller";
import { createEvents } from "../controllers/Events/createEvents.controller";
import { deleteEvents } from "../controllers/Events/deleteEvents.controller";
import { updateEvents } from "../controllers/Events/updateEvents.controller"; 

import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router()

