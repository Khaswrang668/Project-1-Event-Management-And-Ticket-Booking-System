import { createPaymentRecord,manageWebhooks} from "../controllers/Payments/payment.controller.js";
import { Router } from "express";

import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router()

router.route('/:id/payment-request').post(verifyJWT,createPaymentRecord)

export default router