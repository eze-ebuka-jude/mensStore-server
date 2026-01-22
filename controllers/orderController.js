import Order from "../models/ordersModel.js"

export const myOrders = async (req, res, next) => {
    try {
        //Find orders for the authenticated user
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
        res.status(200).json(orders)

    } catch (error) {
        console.error(error)
        return next(new AppError("Error while trying to get my orders!", 500))
    }
}

export const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params
        const order = await Order.findById(id).populate("user", "name email")
        if(!order) return next(new AppError("Order not found!", 404))

        res.status(200).json(order)

    } catch (error) {
        console.error(error)
        return next(new AppError("Error while trying to get orders by Id!", 500))
    }
}