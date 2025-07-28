import mongoose from "mongoose";

const threadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Thread title is required"],
      unique: true,
      trim: true,
      minLength: [3, "Thread title can't be less than 3 characters long"],
      maxLength: [75, "Thread title can't be more than 75 characters long"],
    },

    description: {
      type: String,
      default: "",
      maxLength: [
        300,
        "Thread description can't be more than 300 characters long",
      ],
    },

    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    topicsCount: {
      type: Number,
      default: 0,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Thread = mongoose.model("Thread", threadSchema);

export default Thread;
