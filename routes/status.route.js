import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { multerMiddleware } from "../config/cloudinaryConfig.js";
import { createStatus, deleteStatus, getStatus, viewStatus } from "../controllers/status.controller.js";


const router=express.Router();


//protected routes


router.post('/',authMiddleware,multerMiddleware,createStatus);


router.get("/",authMiddleware,getStatus);


router.put('/:statusId/view',authMiddleware,viewStatus);

router.delete('/:statusId',authMiddleware,deleteStatus);


export default router;