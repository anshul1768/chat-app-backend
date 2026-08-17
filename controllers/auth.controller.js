import { uploadFileToCloudinary } from "../config/cloudinaryConfig.js";
import User from "../models/User.model.js";
import Conversation from "../models/Conversation.model.js"
import sendOtpToEmail from "../services/emailService.js";
import otpGenerate from "../utils/otpGenerator.js";
import response from "../utils/responseHandler.js";
import generateToken from "../utils/tokenGenerator.js";
//Step 1 Send Otp
const sendOtp=async(req,res)=>{
    const{phoneNumber,phoneSuffix,email}=req.body;

    const otp=otpGenerate();
    const expiry=new Date(Date.now()+5*60*1000);
    let user;
    try {
        if(email){
            user=await User.findOne({email});
        if(!user){
            user=new User({email});
        }
        user.emailOtp=otp;
        user.emailOtpExpire=expiry;

        await user.save();
        sendOtpToEmail(email,otp);
        return response(res,200,'Otp send to your email',{email});
        }

        if(!phoneNumber || !phoneSuffix){
            return response (res,400,'Phone number and phone suffix are required');
        }

        const fullPhoneNumber=`${phoneSuffix}${phoneNumber}`;
        user=await User.findOne({phoneNumber});

        if(!user){
            user=await new User({phoneNumber,phoneSuffix});
        }
        await user.save();

        return response(res,200,'otp sent successfully',user);

    } catch (error) {
        console.error(error);
        return response(res,500,'Internal Server Error');        
    }
}

const verifyOtp=async(req,res)=>{
    const {email,otp}=req.body;

    try {
        let user;

        if(email){
            user=await User.findOne({email});

            if(!user){
                return response(res,404,'User not Found');
            }

            const now= new Date();

            if(!user.emailOtp || String(user.emailOtp)!== String(otp) || now>(user.emailOtpExpire)){
                return response(res,400,'Invalid or expired otp');
            }

            user.verified=true;
            user.emailOtp=null,
            user.emailOtpExpire=null,

            await user.save();
        }
        else{
            return response(res,400,'Email Not Found');
        }
        const token =generateToken(user?._id);

        res.cookie("auth_token",token,{
            httpOnly:true,
            maxAge:1000*60*60*24*365,
        });

        return response(res,200,'email Verified Successfully',{token,user});
    } catch (error) {
        console.log(error);
        return response(res,500,'Internal Server Error');
    }
}



const updateProfile=async(req,res)=>{
    console.log("update",req.body);
    const{username,agreed,about}=req.body;

    const userId=req.user.userId;
    try {
        const user=await User.findById(userId);
        const file=req.file;//ye aata h form data me.

        if(file){
            const uploadResult=await uploadFileToCloudinary(file);
            user.profilePicture=uploadResult?.secure_url;
        }
        if(req.body.profilePicture){
            user.profilePicture=req.body.profilePicture;
        }
        if(username){
            user.username=username;
        }
        if(agreed) user.agreed=agreed;

        if(about)user.about=about;

        await user.save();

        return response(res,200,'user profile updated successfully',user);
    } catch (error) {
        console.log(error);
        return response(res,500,'Internal server error');
    }
    
}

const checkAuthenticate=async(req,res)=>{
    try{
        const userId=req.user.userId;

        if(!userId){
            return response(res,401,'User not authorized please login to access our page');
        }

        const user=await User.findById(userId);

        if(!user){
            return response(res,404,'User Not found');
        }

        return response(res,200,'User retrieved successfully',user);
    }catch(error){
        console.log(error);
        return response(res,500,'Internal Server Error');
    }
}

const logout=(req,res)=>{
    try{
        res.clearCookie('auth_token',{
            httpOnly: true,
        });

        return response(res,200,'user logged out successfully');
    }catch(error){
        console.log(error);
        return response(res,500,'Internal Server Error');
    }
}


//get all users to show them in chat.


const getAllUsers=async(req,res)=>{
    const loggedInUser=req.user.userId;
    console.log(`loogged in user is ${loggedInUser}`)
    try{
        //neglecting loggedIn user
        const users=await User.find({_id:{$ne:loggedInUser}}).select("username profilePicture lastSeen isOnline about").lean()
        console.log(users);
        const usersWithConversation=await Promise.all(
            users.map(async (user)=>{
                const conversation =await Conversation.findOne({participants:{$all:[loggedInUser,user?._id]}
                }).populate({
                    path:"lastMessage",
                    select:'content createdAt sender receiver'
                }).lean();

                return {
                    ...user,
                    conversation:conversation|| null
                }
            })
        )
        console.log("user with convo",usersWithConversation); 
        return response(res,200,'Users retrieved successfully',usersWithConversation);
    }catch(error){
        return response(res,500,'Internal Server Error')
    }
}

export {sendOtp,verifyOtp,updateProfile,logout,checkAuthenticate,getAllUsers};