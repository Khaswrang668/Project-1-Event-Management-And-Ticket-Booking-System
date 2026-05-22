import { Router } from "express";
import { generateTicket,verifyTicket } from "../controllers/Tickets/ticket.controller.js";

import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router()

router.route('/generate-Ticket-PDF').post(verifyJWT,generateTicket)
router.route('/verify-Ticket').post(verifyJWT,verifyTicket)

export default router