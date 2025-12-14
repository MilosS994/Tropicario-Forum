import mongoose from "mongoose";
import User from "../models/User";

const seed = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/tropicario-forum-dev");
    console.log("Connected to MongoDB");

    await User.deleteMany({});

    const user = await User.create({
      username: "testuser",
      email: "test@test.com",
      password: "test1234",
      role: "user",
    });

    await mongoose.disconnect();
    console.log("Done");

    console.log("Created user:", user.email);
  } catch (error) {
    console.error(error);
  }
};

seed();
