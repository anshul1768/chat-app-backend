import Status from "../models/Status.model.js";
import response from "../utils/responseHandler.js";
import Message from "../models/Message.model.js";
import { uploadFileToCloudinary } from "../config/cloudinaryConfig.js";

export const createStatus = async (req, res) => {
  try {
    const { content, contentType } = req.body;

    const userId = req.user.userId;

    const file = req.file;

    let mediaUrl = null;

    let finalContentType = contentType || "text";
    if (file) {
      const uploadFile = await uploadFileToCloudinary(file);

      if (!uploadFile?.secure_url) {
        return response(res, 400, "Failed to upload media");
      }
      mediaUrl = uploadFile?.secure_url;

      if (file.mimeType.startWith("image")) {
        finalContentType = "iamge";
      } else if (file.mimeType.startWith("video")) {
        finalContentType = "video";
      } else {
        return response(res, 400, "Unsupported file type");
      }
    } else if (content?.trim()) {
      finalContentType = "text";
    } else {
      return response(res, 400, "Message Content is required");
    }

    const expiryAt = new Date();
    expiryAt.setHours(expiryAt.getHours() + 24);

    const status = new Status({
      user: userId,
      content: mediaUrl || content,
      contentType: finalContentType,
      expiresAt: expiryAt,
    });

    await status.save();

    const populateStatus = await Status.findOne(status?._id)
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture");

    //EMIT SOCKET EVENT (NOTIFY ALL USERS)

    if (req.io && req.socketUserMap) {
      //Broadcast to all connecting users expect creator.

      for (const [connectingUserId, socketId] of req.socketUserMap) {
        if (connectingUserId !== userId) {
          req.io.to(socketId).emit("new_status", populateStatus);
        }
      }
    }

    return response(res, 201, "Status Created Successfully", populateStatus);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
};

export const getStatus = async (req, res) => {
  try {
    const statuses = await Status.find({
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture")
      .sort({ createdAt: -1 });

    return response(res, 200, "Status retrived successfully", statuses);
  } catch (error) {
    console.error(error);

    return response(res, 500, "Internal Server Error");
  }
};

//kitne log view kr rahe h

export const viewStatus = async (req, res) => {
  //jab bhi user status pe click karega tab hum save karenge ki iss user ne iss status ko dekh liya h.

  const { statusId } = req.params;

  const userId = req.user.userId;

  try {
    const status = await Status.findById(statusId);

    if (!status) {
      return response(res, 404, "Status not found");
    }
    if (!status.viewers.includes(userId)) {
      status.viewers.push(userId);

      await status.save();

      const updatedStatus = await Status.findById(statusId)
        .populate("user", "username profilePicture")
        .populate("viewers", "username profilePicture");

      if (req.io && req.socketUserMap) {
        const statusOwnerSocketId = req.socketUserMap.get(
          status.user._id.toString(),
        );

        if (statusOwnerSocketId) {
          const viewData = {
            statusId,
            viewerId: userId,
            totalViewers: updatedStatus.viewers.length,
            viewers: updatedStatus.viewers,
          };
          res.io.to(statusOwnerSocketId).emit("status_viewed", viewData);
        } else {
          console.log(`status owner not connected`);
        }
      }
    } else {
      console.log(`User already viewed the status`);
    }
    return response(res, 200, "status viewed successfully");
  } catch (error) {
    console.error(error);

    return response(res, 500, "Internal Server Error");
  }
};

export const deleteStatus = async (req, res) => {
  const { statusId } = req.params;

  const userId = req.user.userId;

  try {
    const status = await Status.findById(statusId);

    if (!status) {
      return response(res, 404, "Status not found");
    }

    if (status.user.toString() !== userId) {
      return response(res, 401, "Not authorized to delete this status");
    }

    await status.deleteOne();

    //Emit Socket Event

    if (req.io && req.socketUserMap) {
      for (const [connectingUserId, socketId] of req.socketUserMap) {
        if (connectingUserId !== userId) {
          req.io.to(socketId).emit("status_deleted", populateStatus);
        }
      }
    }

    return response(res, 200, "status deleted successfully");
  } catch (error) {
    console.log(error);

    return response(res, 500, "Internal Server Error");
  }
};
