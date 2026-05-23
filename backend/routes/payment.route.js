import { createPaymentRecord } from "../controllers/Payments/payment.controller.js";
import { manageWebhooks } from "../controllers/Payments/webhooks.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
 
const router = Router();
 
// Initiate payment for an event booking (user must be logged in)
router.route("/:eventId/payment-request").post(verifyJWT, createPaymentRecord);
 
// PhonePe webhook — NO auth middleware, PhonePe calls this directly
// Signature verification is handled inside manageWebhooks
router.route("/webhook").post(manageWebhooks);
 
export default router;
 