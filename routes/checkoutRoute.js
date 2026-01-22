import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { createCheckout, isPaid, finalizeCheckout } from "../controllers/checkoutController.js"

const router = express.Router()

router.post('/', protect, createCheckout)
router.put('/:id/pay', protect, isPaid)
router.post('/:id/finalize', protect, finalizeCheckout)

export default router