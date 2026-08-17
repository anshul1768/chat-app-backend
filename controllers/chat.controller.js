import { populate } from "dotenv";
import { uploadFileToCloudinary } from "../config/cloudinaryConfig.js";
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import response from "../utils/responseHandler.js";

export const sendMessage=async(req,res)=>{
try {
    const {senderId,receiverId,content,messageStatus}=req.body;

    const file=req.file;


    //agar jo user se conversation chal raha h wo kya participant me h ya nhi agar nhi h toh naya conversation create karenge.

    const participants=[senderId,receiverId].sort();


    //check if convo already exists?

    let conversation=await Conversation.findOne({participants:participants});


    if(!conversation){
        conversation=new Conversation({
            participants
        });

        await conversation.save();
    }

    let imageVideoUrl=null;

    let contentType=null;


    //handle file upload

    if(file){
        const uploadFile=await uploadFileToCloudinary(file);


        if(!uploadFile?.secure_url
        ){
            return response(res,400,'Failed to Upload Media')
        };
        imageVideoUrl=uploadFile?.secure_url;

        if(file.mimetype.startWith('image')){
            contentType="image";
        }
        else if(file.mimetype.startWith('video')){
            contentType="video";
        }
        else{
            return response(res,400,'Unsupported File Type');
        }
    }
    else if(content?.trim()){
        contentType="text";
    }
    else{
        return response(res,400,"Message Content is required");
    }

    const message=new Message({
        conversation:conversation?._id,
        sender:senderId,
        receiver:receiverId,
        content,
        contentType,
        imageVideoUrl,
        messageStatus
    });

    await message.save();
    if(message?.content){
        conversation.lastMessage=message?._id;
    }

    conversation.unreadCount+=1;   
    await conversation.save();
    
    

    const populatedMessage=await Message.findOne(message?._id).populate("sender","username profilePicture")
    .populate("receiver","username profilePicture");
    // Emit socket event for realtime.
    if(req.io && req.socketUserMap){
        const receiverSocketId=req.socketUserMap.get(receiverId);

        if(receiverSocketId){
            req.io.to(receiverSocketId).emit("receiver_message",populatedMessage);
            message.messageStatus="delevered";
            await message.save();
        }
    }
    return response(res,201,"Message sent successfully",populatedMessage);
} catch (error) {
    console.log(error);
    return response(res,500,'Internal Server Error');
}
}

//get all Conversation of loggedIn user


export const getConversation=async(req,res)=>{
    const userId=req.user.userId;

    try {
        let conversation=await Conversation.find({
            participants:userId,
        }).populate("participants","username profilePicture isOnline lastSeen")
        .populate({
            path:"lastMessage",
            populate:{
                path:"sender receiver",
                select:"username profilePicture"
            }
        }).sort({updatedAt:-1});


        return response(res,201,"Conversation fetched successfully",conversation);
    } catch (error) {
        console.log(error);
        return response(res,500,'Internal Server Error');

    }
};



//get message of a particular user (mtlb jab user uss paricular chat pe click kare toh user user ke saath sare chat aa jaye);

export const getMessages=async(req,res)=>{
    const{conversationId}=req.params;

    const userId=req.user.userId;


    try {
        const conversation=await Conversation.findById(conversationId);


        if(!conversation){
            return response(res,404,'Conversation not found');
        }
        if(!conversation.participants.includes(userId)){
            return response(res,403,"Not authorized to view this conversation");
        }


        const messages=await Message.find({conversation:conversationId}).populate("sender","username profilePicture")
        .populate("receiver","username profilePicture")
        .sort("createdAt");


        await Message.updateMany(
            {
                conversation:conversationId,
                receiver:userId,

                messageStatus:{$in:["send","delivered"]},
            },
            {$set:{messageStatus:"read"}},
        );

        conversation.unreadCount=0;

        await conversation.save();


        return response(res,200,"Message retrieved",messages);
    } catch (error) {
        console.log(error);
        return response(res,500,'Internal Server Error');
    }
}


export const markAsRead=async(req,res)=>{
    console.log(req.body);
    const {messageId}=req.body;

    const userId=req.user.userId;

    try {
        //get relevant messages to determine senders.


        let messages=await Message.find({
            _id:{$in:messageId},
            receiver:userId
        })

        let result=await Message.updateMany({
              _id: { $in: messageId },
                receiver: userId,
                messageStatus: "sent",
        },
        {$set:{messageStatus:"read"}}

        //notify to original sender

        
    )
    if(req.io && req.socketUserMap){
            for(const message of messages){
                const senderSocketId=req.socketUserMap.get(message.sender.toString());
                if(senderSocketId){
                    const updatedMessage={
                        _id:message._id,
                        messageStatus:"read",
                    };
                    req.io.to(senderSocketId).emit("message_read",updatedMessage);
                    await message.save();
                }
            }
        }
    console.log(result)
     return response(res,200,"Messages marked as read");
    } catch (error) {
        console.log(error);
        return response(res,500,'Internal Server Error');
    }
}


export const deleteMessage=async(req,res)=>{
    const {messageId}=req.params;

    const  userId =req.user.userId;


    try {
        const message=await Message.findById(messageId);


        if(!message){
            return response(res,404,"Message Not Found");
        }

        if(message.sender.toString()!==userId){
            return response(res,401,'Not authorized to delete this message');
        }
        await message.deleteOne();

        //Emit Socket Event

    if (req.io && req.socketUserMap) {
      const receiverSocketId=req.socketUserMap.get(message.receiver.toString());

      if(receiverSocketId){
        req.io.to(receiverSocketId).emit("message_deleted",messageId);
      }
      }
    return response(res,200,"Message deleted successfully");
    } catch (error) {
        console.log(error);
        return response(res,500,'Internal Server Error');
    }
}


