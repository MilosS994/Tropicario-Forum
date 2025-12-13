// ======================
// IMPORTS
// ======================
import mongoose from "mongoose";
import { IComment } from "@/types/comment";

// ======================
// MODEL DEFINITION
// ======================
const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      minlength: [1, "Comment content must be at least 1 character long"],
      maxlength: [50000, "Comment content must not exceed 50000 characters"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },

    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: [true, "Topic is required"],
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },

    usersLiked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    likesCount: {
      type: Number,
      default: 0,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Don't return __v field in responses
commentSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// Indexes for optimizing queries
commentSchema.index({ createdAt: -1 });
commentSchema.index({ isPinned: 1, createdAt: -1 });
commentSchema.index({ topic: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

const Comment =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
