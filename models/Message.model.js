import mongoose, { mongo } from "mongoose";
import Conversation from "./Conversation.model.js";
import User from "./User.model.js";
const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  content:{
    type:String,
  },
  imageVideoUrl:{
    type:String
  },

  contentType:{
    type:String,enum:['image','video','text']
  },
  reactions: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    emoji: {
      type: String,
    },
  },
],
  messageStatus:{
    type:String,
    default:'send'
  },
},{timestamps:true});


const Message=mongoose.model('Message',messageSchema);

export default Message;
