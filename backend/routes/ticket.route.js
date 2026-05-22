import { Router } from "express";
import { generateTicket,verifyTicket,getTicketData } from "../controllers/Tickets/ticket.controller.js";

import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router()

router.route('/generate-Ticket-PDF').post(verifyJWT,generateTicket)
router.route('/verify-Ticket').post(verifyJWT,verifyTicket)
router.route('/ticket-data').get(verifyJWT,getTicketData)

export default router