import jwt from "jsonwebtoken";
import response from "../utils/responseHandler.js";


const authMiddleware=(req,res,next)=>{
    const authToken=req.cookies?.auth_token;//cookie parser
    if(!authToken){
        return response(res,401,'authorization token missing.Please provide tokenwa');
    }
    try {
        const decode =jwt.verify(authToken,process.env.TOKEN_SECRET);
        req.user=decode;
        console.log(req.user);
        next();
    } catch (error) {
        console.log(error);
        return response(res,401,'Invalid or expired token');
    }
}

export {authMiddleware};