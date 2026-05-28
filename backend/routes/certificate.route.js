import { Router } from "express";
import { certificateController } from "../controllers/Certificates/certificate.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { getEligibleParticipants } from "../controllers/Certificates/getEligibleParticipants.js";

const router = Router()

router.route('/:eventId/eligible-participants').get(verifyJWT,getEligibleParticipants)
router.route('/:ticketId/:attendenceId/generate-certificate').post(verifyJWT,certificateController)

export default router