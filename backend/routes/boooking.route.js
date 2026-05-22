import { Router } from "express";

import { createBooking } from "../controllers/Bookings/booking.controller.js";

import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router()

router.route('/create-booking').post(verifyJWT,createBooking)

export default router