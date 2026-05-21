import express from 'express'
import {userLogin,refreshAccessToken} from '../controllers/login.controller.js'
import {signUp} from '../controllers/signUp.controller.js'
//import { verifyJWT } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('/register').post(signUp)

router.route('/login').post(userLogin)

router.route('/refresh-access-token').post(refreshAccessToken)

export default router