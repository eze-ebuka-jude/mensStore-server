import express from "express";
import { protect, adminPermission } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllProducts,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/adminController.js";

const router = express.Router();

router
  .route("/users")
  .get(protect, adminPermission, getAllUsers)
  .post(protect, adminPermission, createUser);
router
  .route("/users/:id")
  .put(protect, adminPermission, updateUser)
  .delete(protect, adminPermission, deleteUser);

router.route("/products").get(protect, adminPermission, getAllProducts);

router.route("/orders").get(protect, adminPermission, getAllOrders);

router
  .route("/orders/:id")
  .put(protect, adminPermission, updateOrderStatus)
  .delete(protect, adminPermission, deleteOrder);

export default router;
