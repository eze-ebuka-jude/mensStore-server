import AppError from "../utils/appError.js"
import Checkout from "../models/checkoutModel.js"
import Order from "../models/ordersModel.js"
import Cart from "../models/cartModel.js"

export const createCheckout = async (req, res, next) => {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body

    try {
        if(!checkoutItems || checkoutItems.length === 0) return next(new AppError("No items in checkout!", 400))
        
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus: "Pending",
            isPaid: false
        })

        res.status(201).json(newCheckout)
    } catch (error) {
        console.error(error)
        return next(new AppError("Error while trying to create checkout!", 500))
    }
}

export const isPaid = async (req, res, next) => {
    const { paymentStatus, paymentDetails } = req.body

    try {
        const { id } = req.params
        const checkout = await Checkout.findById(id)

        if(!checkout) return next(new AppError("Checkout not found!", 404))

        if(paymentStatus === "paid") {
            checkout.isPaid = true
            checkout.paymentStatus = paymentStatus
            checkout.paymentDetails = paymentDetails
            checkout.paidAt = Date.now()

            await checkout.save()
            res.status(200).json(checkout)
        }else {
            return next(new AppError("Invalid Payment Status!", 400))
        }

    } catch (error) {
        console.error(error)
        return next(new AppError("Error while trying to update checkout as paid!", 500))
    }
}

export const finalizeCheckout = async (req, res, next) => {
    try {
        const { id } = req.params
        const checkout = await Checkout.findById(id)

        if(!checkout) return next(new AppError("Checkout not found!", 404))
        
        if(checkout.isPaid && !checkout.isFinalized) {
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
                paymentDetails: checkout.paymentDetails
            })

            //Mark the checkout as finalized
            checkout.isFinalized = true
            checkout.finalizedAt = Date.now()
            await checkout.save()

            //Delete the cart associated with the user
            await Cart.findOneAndDelete({ user: checkout.user })
            res.status(200).json(finalOrder)

        }else if(checkout.isFinalized) {
            return next(new AppError("Checkout already finalized!", 400))
        }else {
            return next(new AppError("Checkout is not paid!", 400))
        }

    } catch (error) {
        console.error(error)
        return next(new AppError("Error while trying finalize checkout!", 500))
    }
}