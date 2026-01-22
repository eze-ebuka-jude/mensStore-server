import express from "express"
import { createProduct, updateProduct, deleteProduct, getBestSeller, getNewArrivals, getProducts, getProduct, getSimilarProducts } from "../controllers/productController.js"
import { protect, adminPermission } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route('/', protect, adminPermission).post(createProduct)
router.route('/').get(getProducts)
router.route('/best-seller').get(getBestSeller)
router.route('/new-arrivals').get(getNewArrivals)
router.route('/:id').get(getProduct)
router.route('/similar/:id').get(getSimilarProducts)
router.route('/:id', protect, adminPermission).put(updateProduct).delete(deleteProduct)

export default router