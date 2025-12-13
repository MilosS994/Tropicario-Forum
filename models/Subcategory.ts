// ======================
// IMPORTS
// ======================
import mongoose from "mongoose";
import { ISubcategory } from "@/types/subcategory";

// ======================
// MODEL DEFINITION
// ======================
const subcategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Subcategory title is required"],
      unique: true,
      minlength: [2, "Subcategory title must be at least 2 characters long"],
      maxlength: [100, "Subcategory title must not exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Subcategory description must not exceed 500 characters",
      ],
    },

    slug: {
      type: String,
      trim: true,
      required: [true, "Subcategory slug is required"],
      unique: true,
      lowercase: true,
      minlength: [2, "Subcategory slug must be at least 2 characters long"],
      maxlength: [120, "Subcategory slug must not exceed 120 characters"],
    },

    topics: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: [] },
    ],

    topicsCount: {
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
subcategorySchema.pre("validate", function () {
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
subcategorySchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// Indexes for optimizing queries
subcategorySchema.index({ title: 1 });
subcategorySchema.index({ slug: 1 });
subcategorySchema.index({ order: 1 });
subcategorySchema.index({ topicsCount: 1 });
subcategorySchema.index({ createdAt: -1 });

const Subcategory =
  mongoose.models.Subcategory ||
  mongoose.model<ISubcategory>("Subcategory", subcategorySchema);

export default Subcategory;
