import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import AppError from "../utils/appError.js";

//Helper Function to get a cart by user Id or guest Id
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
  return null;
};

export const getCartProductById = async (req, res, next) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return next(new AppError("Product not found!", 404));

    //Determine if the user is logged in or a guest
    let cart = await getCart(userId, guestId);

    //If the cart exists, update it
    if (cart) {
      const productIndex = cart.products.findIndex(
        (prod) =>
          prod.productId.toString() === productId &&
          prod.size === size &&
          prod.color === color
      );

      if (productIndex > -1) {
        //If the product already exists, update the quantity
        cart.products[productIndex].quantity += quantity;
      } else {
        //add new product
        cart.products.push({
          productId,
          name: product.name,
          image: product.images[0].url,
          price: product.price,
          size,
          color,
          quantity,
        });
      }

      //Recalculate the total price
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      //Create a new cart for the guest or user
      const newCart = await Cart.create({
        user: userId ? userId : undefined,
        guestId: guestId ? guestId : "guest_" + new Date().getTime(),
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0].url,
            price: product.price,
            size,
            color,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });

      return res.status(201).json(newCart);
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying get cart by id", 500));
  }
};

export const updateCartProduct = async (req, res, next) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;
  try {
    let cart = await getCart(userId, guestId);
    if (!cart) return next(new AppError("Cart not found!", 404));

    const productIndex = cart.products.findIndex(
      (prod) =>
        prod.productId.toString() === productId &&
        prod.size === size &&
        prod.color === color
    );

    if (productIndex > -1) {
      //update quantity
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1); //Remove product if quantity is 0
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return next(new AppError("Product not found in cart!", 404));
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying to update cart!", 500));
  }
};

export const deleteCartProduct = async (req, res, next) => {
  const { productId, size, color, guestId, userId } = req.body;
  try {
    let cart = await getCart(userId, guestId);
    if (!cart) return next(new AppError("Cart not found!", 404));

    const productIndex = cart.products.findIndex(
      (prod) =>
        prod.productId.toString() === productId &&
        prod.size === size &&
        prod.color === color
    );

    if (productIndex > -1) {
      cart.products.splice(productIndex, 1);

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return next(new AppError("Product not found!", 404));
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying to delete cart!", 500));
  }
};

export const getUserCart = async (req, res, next) => {
  const { userId, guestId } = req.query;

  try {
    const cart = await getCart(userId, guestId);
    if (!cart) return next(new AppError("Cart not found!", 404));

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying to get user cart!", 500));
  }
};

export const mergeUserCart = async (req, res, next) => {
  const { guestId } = req.body;

  try {
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });

    if (guestCart) {
      if (guestCart.products.length === 0)
        return next(new AppError("Guest cart is empty", 400));

      if (userCart) {
        //Merge guest cart into user cart
        guestCart.products.forEach((guestItem) => {
          const productIndex = userCart.products.findIndex(
            (item) =>
              item.productId.toString() === guestItem.productId.toString() &&
              item.size === guestItem.size &&
              item.color === guestItem.color
          );

          if (productIndex > -1) {
            //If the items exists in the user cart, update the quantity
            userCart.products[productIndex].quantity += guestItem.quantity;
          } else {
            //Or add the guest item to the cart
            userCart.products.push(guestItem);
          }
        });

        userCart.totalPrice = userCart.products.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
        await userCart.save();

        //Remove the guest cart after merging
        try {
          await Cart.findOneAndDelete({ guestId });
        } catch (error) {
          console.error(error);
          return next(new AppError("Error deleting guest cart:", 500));
        }

        res.status(200).json(userCart);
      } else {
        //If the user has no existing cart, assign the guset cart to the user
        guestCart.user = req.user._id;
        guestCart.guestId = undefined;
        await guestCart.save();

        res.status(200).json(guestCart);
      }
    } else {
      if (!userCart) return next(new AppError("Guest cart not found!", 404));

      //If guest cart has already been merged, return user cart
      return res.status(200).json(userCart);
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("Error while trying to merge user data!", 500));
  }
};
