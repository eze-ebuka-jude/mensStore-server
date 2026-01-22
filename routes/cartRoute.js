import express from "express"
import { getCartProductById, updateCartProduct, deleteCartProduct, getUserCart, mergeUserCart } from "../controllers/cartController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post('/merge', protect, mergeUserCart)
router.route('/').post(getCartProductById).get(getUserCart).put(updateCartProduct).delete(deleteCartProduct)

export default router