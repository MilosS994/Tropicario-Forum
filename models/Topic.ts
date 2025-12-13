// ======================
// IMPORTS
// ======================
import mongoose from "mongoose";
import { ITopic } from "@/types/topic";

// ======================
// MODEL DEFINITION
// ======================
const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Topic title is required"],
      minlength: [3, "Topic title must be at least 3 characters long"],
      maxlength: [175, "Topic title must not exceed 175 characters"],
    },

    content: {
      type: String,
      trim: true,
      required: [true, "Topic content is required"],
      minlength: [1, "Topic content must be at least 1 character long"],
      maxlength: [50000, "Topic content must not exceed 50000 characters"],
    },

    slug: {
      type: String,
      trim: true,
      required: [true, "Topic slug is required"],
      unique: true,
      lowercase: true,
      minlength: [2, "Topic slug must be at least 1 character long"],
      maxlength: [120, "Topic slug must not exceed 200 characters"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },

    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: [true, "Subcategory is required"],
    },

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: [],
      },
    ],

    likesCount: {
      type: Number,
      default: 0,
    },

    viewsCount: {
      type: Number,
      default: 0,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Generate slug before saving
topicSchema.pre("validate", function () {
  if (this.title && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "") + `-${Date.now()}`;
  }
});

// Don't return __v field in responses
topicSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// Indexes for optimizing queries
topicSchema.index({ title: 1 });
topicSchema.index({ content: "text" });
topicSchema.index({ isPinned: -1, lastActivityAt: -1 });
topicSchema.index({ isLocked: -1, lastActivityAt: -1 });
topicSchema.index({ createdAt: -1 });
topicSchema.index({ subcategory: 1 });

const Topic =
  mongoose.models.Topic || mongoose.model<ITopic>("Topic", topicSchema);

export default Topic;
