import AppError from "../utils/appError.js"
import Subscriber from "../models/subscriberModel.js"

export const subscriber = async (req, res, next) => {
    const { email } = req.body
    if(!email) return res.status(404).json({ message: "Email is required" })

    try {
        let subscriber = await Subscriber.findOne({ email })
        if(subscriber) return res.status(400).json({ message: "email is already subscribed!" })

        subscriber = new Subscriber({ email })
        await subscriber.save()

        res.status(200).json({
            status: "success",
            message: "Successfully subscribed to our newsletter!"
        })

    } catch (error) {
        console.error(error)
        return next(new AppError("Error while trying to subscribe!", 500))
    }
}