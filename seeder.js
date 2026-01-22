import dotenv from "dotenv"
import mongoose from "mongoose"
import User from "./models/userModel.js"
import Product from "./models/productModel.js"
import Cart from "./models/cartModel.js"
import products from "./data/products.js"

dotenv.config()

mongoose.connect(process.env.MONGO_URI)

const seedData = async () => {
    try {
        await Product.deleteMany()
        await User.deleteMany()
        await Cart.deleteMany()

        const createdUser = await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: "123456",
            role: "admin"
        })

        const userId = createdUser._id
        const sampleProducts = products.map(prod => (
            { ...prod, user: userId}
        ))

        await Product.insertMany(sampleProducts)
        process.exit()
    } catch (error) {
        console.error("Error seeding data!", error)
        process.exit(1)
    }
}

seedData()