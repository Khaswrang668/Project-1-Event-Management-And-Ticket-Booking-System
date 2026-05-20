import express from 'express'
import {userLogin} from './controllers/login.controller.js'
import {signUp} from './controllers/signUp.controller.js'

const router = express.Router()

router.route('/login').get(userLogin)
router.route('/signUp').get(signUp)

export default router