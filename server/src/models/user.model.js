import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minLength: [2, "Username can't be less than 2 characters long"],
      maxLength: [55, "Username can't be more than 55 characters long"],
      required: function () {
        return this.status !== "deleted";
      },
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      maxLength: [75, "Full name can't be more than 75 characters long"],
      trim: true,
    },

    email: {
      type: String,
      required: function () {
        return this.status !== "deleted";
      },
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
      trim: true,
    },

    password: {
      type: String,
      minLength: [8, "Password must be at least 8 characters long"],
      required: [true, "Password is required"],
    },

    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      maxLength: [500, "Biography is too long"],
      default: "",
    },

    location: {
      type: String,
      maxLength: [100, "Location name is too long"],
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "banned", "deleted"],
      default: "active",
    },

    bannedAt: {
      type: Date,
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    anonymizedBackup: {
      type: Object,
      default: null,
    },

    lastLogin: {
      type: Date,
    },

    birthday: {
      type: Date,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    passwordResetToken: {
      type: String,
    },

    passwordResetExpires: {
      type: Date,
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Hash the password if it has been modified or is new
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(`Error comparing password: ${error.message}`);
  }
};

const User = mongoose.model("User", userSchema);

export default User;
