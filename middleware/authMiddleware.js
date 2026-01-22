import AppError from "../utils/appError.js"
import jwt from "jsonwebtoken"
import { promisify } from "util"
import User from "../models/userModel.js"

export const adminPermission = (req, res, next) => {
    if(req.user && req.user.role !== "admin") return next(new AppError("Not authorized as an admin", 403))
    
    next()
}

export const protect = async(req, res, next) => {
    try {
        // Get token and check if its there
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if(!token) return next(new AppError('You are not logged In!, Please log in to get access', 401))
    
    //Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    //Check if user still exists
    const userStillExist = await User.findById(decoded.id).select('-password')
    if(!userStillExist) return next(new AppError('The user with this token does no longer exist!', 400))

    //Check if user changed password after the token was issued

    //Grant access to protected route
    req.user = userStillExist
    res.locals.user = userStillExist
    next()
    } catch (error) {
        console.error(error);
        return next(new AppError('Token Verification failed, Error while trying to acess protected route!', 500))
    }
}