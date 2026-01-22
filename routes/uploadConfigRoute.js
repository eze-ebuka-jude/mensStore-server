import express from "express"
import { upload, uploadImage } from "../controllers/uploadConfigController.js"
import { protect, adminPermission } from "../middleware/authMiddleware.js"

const router = express.Router()

console.log(upload);
router.post('/', protect, adminPermission, upload.single("Image"), uploadImage)

export default router