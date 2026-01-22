import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/ordersModel.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ name: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error while trying to get all users by admin!", 500)
    );
  }
};

export const createUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ message: `User with email ${email} already exist!` });

    user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
    });

    res.status(201).json({
      status: "success",
      message: "User created successfully!",
      user,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error while trying to create user by admin!", 500)
    );
  }
};

export const updateUser = async (req, res, next) => {
  const { name, email, role } = req.body;
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "User not found!" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    const updatedUser = await user.save();

    res.status(200).json({
      status: "success",
      message: "User Info updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error while trying to update user info by admin!", 500)
    );
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error while trying to delete user by admin!", 500)
    );
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ name: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error while trying to get all products by admin!", 500)
    );
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate("user", "name email");
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error while trying to get all orders by admin!", 500)
    );
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);

    if (!order)
      return res
        .status(404)
        .json({ message: `Order with the id ${id} does not exist!` });

    order.status = status || order.status;
    order.isDelivered = status === "Delivered" ? true : order.isDelivered;
    order.deliveredAt = status === "Delivered" ? Date.now() : order.deliveredAt;

    const updatedOrder = await order.save();
    console.log(updatedOrder);
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error while trying to update order status by admin!", 500)
    );
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.status(200).json({ message: "Order was deleted successfully!" });
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error while trying to delete order by admin!", 500)
    );
  }
};
