import express from "express";
import { checkAuthenticate, getAllUsers, logout, sendOtp, updateProfile, verifyOtp } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { multerMiddleware } from "../config/cloudinaryConfig.js";


const router=express.Router();

//normal route
router.post('/send-otp',sendOtp);
router.post('/verify-otp',verifyOtp);
//protected route
router.get('/logout',authMiddleware,logout);
router.put('/update-profile',authMiddleware,multerMiddleware,updateProfile)
router.get('/check-auth',authMiddleware,checkAuthenticate);
router.get('/users',authMiddleware,getAllUsers);
export default router;