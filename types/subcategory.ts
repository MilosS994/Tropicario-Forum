// =====================
// IMPORTS
// =====================
import mongoose from "mongoose";

// Subcategory interface
export interface ISubcategory extends mongoose.Document {
  title: string;
  description?: string;
  slug: string;
  topics: mongoose.Schema.Types.ObjectId[];
  topicsCount: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
