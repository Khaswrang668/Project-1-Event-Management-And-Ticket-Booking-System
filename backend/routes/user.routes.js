import express from 'express'
import {userLogin,refreshAccessToken,logOut} from '../controllers/Users/login.controller.js'
import {signUp} from '../controllers/Users/signUp.controller.js'
import { verifyJWT } from '../middlewares/authMiddleware.js'
//import { verifyJWT } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('/register').post(signUp)

router.route('/login').post(userLogin)

router.route('/refresh-access-token').post(refreshAccessToken)

router.route('/log-out').post(verifyJWT,logOut)

export default router