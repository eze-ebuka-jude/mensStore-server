import AppError from "../utils/appError.js";
import Checkout from "../models/checkoutModel.js";
import Order from "../models/ordersModel.js";
import Cart from "../models/cartModel.js";
import { stripe } from "../config/stripe.js";
import crypto from "crypto";

const secureRandomString = (length = 10) => {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);
};

export const createCheckout = async (req, res, next) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
    req.body;

  try {
    if (!checkoutItems || checkoutItems.length === 0)
      return next(new AppError("No items in checkout!", 400));

    const calculatedPrice = checkoutItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: checkoutItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),

      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });

    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice: calculatedPrice === totalPrice ? totalPrice : calculatedPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });

    const stripeCheckoutId = secureRandomString(10);

    res.status(201).json({
      newCheckout,
      url: session.url,
      stripeCheckoutId: `SCI_${stripeCheckoutId}`,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying to create checkout!", 500));
  }
};

export const isPaid = async (req, res, next) => {
  const { paymentStatus, paymentDetails } = req.body;

  try {
    const { id } = req.params;
    const checkout = await Checkout.findById(id);

    if (!checkout) return next(new AppError("Checkout not found!", 404));

    if (paymentStatus === "paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();

      await checkout.save();
      res.status(200).json(checkout);
    } else {
      return next(new AppError("Invalid Payment Status!", 400));
    }
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error while trying to update checkout as paid!", 500)
    );
  }
};

export const finalizeCheckout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const checkout = await Checkout.findById(id);

    if (!checkout) return next(new AppError("Checkout not found!", 404));

    if (checkout.isPaid && !checkout.isFinalized) {
      //Create final order based on the checkout details
      const finalOrder = await Order.create({
        user: checkout.user,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkout.paymentDetails,
      });

      //Mark the checkout as finalized
      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();

      //Delete the cart associated with the user
      await Cart.findOneAndDelete({ user: checkout.user });
      res.status(200).json(finalOrder);
    } else if (checkout.isFinalized) {
      return next(new AppError("Checkout already finalized!", 400));
    } else {
      return next(new AppError("Checkout is not paid!", 400));
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying finalize checkout!", 500));
  }
};
