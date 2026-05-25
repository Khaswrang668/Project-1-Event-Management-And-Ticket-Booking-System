import { createPaymentRecord } from "../controllers/Payments/payment.controller.js";
import { manageWebhooks } from "../controllers/Payments/webhooks.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { handleCallBack } from "../controllers/Payments/callback.controller.js";

const router = Router();
 
// Initiate payment for an event booking (user must be logged in)
router.route("/:eventId/payment-request").post(verifyJWT, createPaymentRecord);
 
// PhonePe webhook — NO auth middleware, PhonePe calls this directly
// Signature verification is handled inside manageWebhooks
router.route("/webhook").post(manageWebhooks);

router.route("/payment/callback").get(verifyJWT, handleCallBack)

export default router;
 