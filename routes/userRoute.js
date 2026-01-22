import express from "express";
import { Signin, Signup, GetUser } from "../controllers/userController.js";
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router();

router.post("/register", Signup);
router.post("/login", Signin);
router.get('/profile', protect, GetUser)

export default router;
