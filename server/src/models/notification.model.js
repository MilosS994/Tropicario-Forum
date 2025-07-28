import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    type: {
      type: String, // dm, ban, comment etc
      required: true,
      maxlength: [25, "Type can't be more than 25 characters long"],
      minlength: [2, "Type can't be less than 2 characters long"],
    },

    message: {
      type: String,
      required: true,
      maxlength: [75, "Message can't be more than 75 characters long"],
      minlength: [3, "Message can't be less than 3 characters long"],
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
