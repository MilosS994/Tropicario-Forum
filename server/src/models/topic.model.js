import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Topic title is required"],
      minlength: [3, "Topic title must be at least 3 characters long"],
      maxlength: [100, "Topic title can't be more than 100 characters long"],
      trim: true,
    },

    content: {
      type: String,
      required: [true, "Topic content is required"],
      minLength: [1, "Topic content can't be empty"],
    },

    thread: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    slug: {
      type: String,
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    pinned: {
      type: Boolean,
      default: false,
    },

    closed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

topicSchema.index({ slug: 1, thread: 1 }, { unique: true });

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;
