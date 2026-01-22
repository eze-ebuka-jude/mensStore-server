import express from "express"
import { subscriber } from "../controllers/subscriberController.js"

const router = express.Router()

router.post('/', subscriber)

export default router