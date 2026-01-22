import express from "express"
import { myOrders, getOrderById } from "../controllers/orderController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get('/my-orders', protect, myOrders)
router.get('/:id', protect, getOrderById)

export default router