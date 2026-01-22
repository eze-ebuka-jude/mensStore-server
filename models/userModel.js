import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: ["Kindly enter your name!"],
      trim: true,
    },
    email: {
      type: String,
      required: ["Kindly enter your email address!"],
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email!"],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    password: {
      type: String,
      minLength: [6, "Password must not be less than 6 characters"],
      required: [true, "Kindly enter your password!"],
      select: false,
    },
  },
  { timestamps: true }
);

//Password hash middleware
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

//If Password match
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
