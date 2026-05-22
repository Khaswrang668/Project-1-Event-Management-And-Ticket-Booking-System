import { Router } from "express";
import { certificateController } from "../controllers/Certificates/certificate.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router()

router.route('/generate-certificate').post(verifyJWT,certificateController)

export default router