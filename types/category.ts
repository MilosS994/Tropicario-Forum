// =====================
// IMPORTS
// =====================
import mongoose from "mongoose";

// Category interface
export interface ICategory extends mongoose.Document {
  title: string;
  description?: string;
  slug: string;
  subcategories: mongoose.Schema.Types.ObjectId[];
  subcategoriesCount: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
