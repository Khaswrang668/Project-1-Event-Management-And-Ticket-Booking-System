import express from 'express'
import {userLogin} from '../controllers/login.controller.js'
import {signUp} from '../controllers/signUp.controller.js'

const router = express.Router()

router.route('/login').post(userLogin)
router.route('/signUp').post(signUp)

export default router