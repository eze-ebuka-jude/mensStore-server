import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js"
import cartRouter from "./routes/cartRoute.js"
import checkoutRouter from "./routes/checkoutRoute.js"
import orderRouter from "./routes/orderRoute.js"
import uploadRouter from "./routes/uploadConfigRoute.js"
import subscriberRouter from "./routes/subscriberRoute.js"
import adminRouter from "./routes/adminRoute.js"

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/checkout", checkoutRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/subscribe", subscriberRouter)

//Admin Routes
app.use('/api/v1/admin', adminRouter)

app.get("/", (req, res) => {
  res.send("WELCOME TO MY APP");
});

export default app;
