// =====================
// IMPORTS
// =====================
import mongoose from "mongoose";

// Comment interface
export interface IComment extends mongoose.Document {
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  topic: mongoose.Schema.Types.ObjectId;
  parentComment?: mongoose.Schema.Types.ObjectId;
  usersLiked: mongoose.Schema.Types.ObjectId[];
  likesCount: number;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
