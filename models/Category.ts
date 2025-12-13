// ======================
// IMPORTS
// ======================
import mongoose from "mongoose";
import { ICategory } from "@/types/category";

// ======================
// MODEL DEFINITION
// ======================
const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Category title is required"],
      unique: true,
      minlength: [2, "Category title must be at least 2 characters long"],
      maxlength: [100, "Category title must not exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Category description must not exceed 500 characters"],
    },

    slug: {
      type: String,
      trim: true,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      minlength: [2, "Category slug must be at least 2 characters long"],
      maxlength: [120, "Category slug must not exceed 120 characters"],
    },

    subcategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", default: [] },
    ],

    subcategoriesCount: {
      type: Number,
      default: 0,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Generate slug before saving
categorySchema.pre("validate", function () {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }
});

// Don't return __v field in responses
categorySchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// Indexes for optimizing queries
categorySchema.index({ title: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ subcategoriesCount: -1 });
categorySchema.index({ createdAt: -1 });

const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);

export default Category;
