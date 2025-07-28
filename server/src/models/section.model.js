import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minLength: [2, "Section title can't be less than 2 characters long"],
      maxLength: [55, "Section title can't be more than 55 characters long"],
      required: [true, "Section title is required"],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      maxLength: [300, "Description can't be more than 300 characters long"],
    },

    order: {
      type: Number,
      default: 0,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Section = mongoose.model("Section", sectionSchema);

export default Section;
