import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true, //null ko chor ke
  },
  phoneSuffix: {
    type: String,
    unique: false,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
    trim:true,
    unique: true,
    lowercase:true,
     match: [
      /^\S+@\S+\.\S+$/,
      "Please enter a valid email address",
    ],
  },
  emailOtp:{
    type:String,
  },
  emailOtpExpire:{
    type:Date,
  },
  profilePicture:{
    type:String,
  },
  about:{
    type:String,
  },
  lastSeen:{
    type:Date,
  },
  isOnline:{
    type:Boolean,
    default:false
  },
  isVerified:{
    type:Boolean,
    default:false,
  },
  agreed:{
    type:Boolean,
    default:false,
  },
},{timestamps:true});


const User=mongoose.model('User',userSchema);

export default User;
