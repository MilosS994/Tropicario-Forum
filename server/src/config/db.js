import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const uri =
      process.env.NODE_ENV === "test"
        ? process.env.MONGO_URI_TEST
        : process.env.MONGO_URI;

    await mongoose.connect(uri);
    console.log(
      `Successfully connected to MongoDB in ${process.env.NODE_ENV} mode`
    );
  } catch (error) {
    console.error("ERROR CONNECTING TO DATABASE:\n", error);
    process.exit(1);
  }
};

export default connectDB;
