// =====================
// IMPORTS
// =====================
import mongoose from "mongoose";

// Topic interface
export interface ITopic extends mongoose.Document {
  title: string;
  content: string;
  slug: string;
  author: mongoose.Schema.Types.ObjectId;
  subcategory: mongoose.Schema.Types.ObjectId;
  comments: mongoose.Schema.Types.ObjectId[];
  likesCount: number;
  viewsCount: number;
  isPinned: boolean;
  isLocked: boolean;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
