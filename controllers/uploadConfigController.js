import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary"
import streamifier from "streamifier"
import multer from "multer"
import AppError from "../utils/appError.js"

dotenv.config();

//Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

//Multer setup using memory storage
const storage = multer.memoryStorage()

export const upload = multer({ storage })

export const uploadImage = async (req, res, next) => {
    try {
        if(!req.file) return res.status(400).json({ message: "No file Uploaded!" })

        //Function to handle the stream upload to Cloudinary
        const streamUpload = fileBuffer => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    if(result) {
                        resolve(result)
                    }else {
                        reject(error)
                    }
                })

                //Use streamifier to convert file buffer to a stream
                streamifier.createReadStream(fileBuffer).pipe(stream)
            })
        }

        //Call the streamUpload function
        const result = await streamUpload(req.file.buffer)

        console.log("RESULTS OOOO", process.env.CLOUDINARY_API_SECRET);

        res.status(200).json({ imageUrl: result.secure_url })

    } catch (error) {
        console.error(error)   
        return next(new AppError("Error while trying to upload image!", 500))
    }
}