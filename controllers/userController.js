import User from "../models/userModel.js";
import { createSendToken } from "./authController.js";
import AppError from "../utils/appError.js";

export const Signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "User already exist with the same email!" });

    existingUser = new User({ name, email, password });
    await existingUser.save();

    createSendToken(existingUser, 201, res);
  } catch (error) {
    console.error(error);
    return next(new AppError("Error occured while trying to sign up!", 500));
  }
};

export const Signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return next(new AppError("Kindly enter your email and password!", 400));

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return next(new AppError("Incorrect email or password!"));

    createSendToken(user, 200, res);
  } catch (error) {
    console.error(error);
    return next(new AppError("Error occured while trying to Login!", 500));
  }
};

export const GetUser = async (req, res, next) => {
  res.json(req.user)
}
