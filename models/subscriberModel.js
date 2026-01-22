import mongoose from "mongoose"
import validator from "validator"

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        trim: true,
        validate: [validator.isEmail, "Please provide a valid email!"]
    },
    subscribedAt: {
        type: Date,
        default: Date.now()
    }
})

const Subscriber = mongoose.model("Subscriber", subscriberSchema)
export default Subscriber