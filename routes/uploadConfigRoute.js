import express from "express";
import { upload, uploadImage } from "../controllers/uploadConfigController.js";
import { protect, adminPermission } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, adminPermission, upload.single("Image"), uploadImage);

export default router;
