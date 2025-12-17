// ======================
// IMPORTS
// ======================
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "crypto";
import { IUser } from "@/types/user";

// ======================
// MODEL DEFINITION
// ======================

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, "Username is required"],
      unique: true,
      minlength: [2, "Username must be at least 2 characters long"],
      maxlength: [55, "Username can't be more than 55 characters long"],
      match: [
        /^[\w-]+$/,
        "Username can only contain letters, numbers, hyphens and underscores",
      ],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: function (email: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // do not return password field by default
    },

    fullName: {
      type: String,
      trim: true,
      maxlength: [100, "Full name can't be more than 100 characters long"],
    },

    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "banned", "disabled"],
      default: "active",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio can't be more than 500 characters long"],
    },

    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location can't be more than 100 characters long"],
    },

    age: {
      type: Number,
      min: [13, "User must be at least 13 years old"],
      max: [120, "Age seems unrealistic"],
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    postsCount: {
      type: Number,
      default: 0,
      min: [0, "Posts count can't be negative"],
    },

    commentsCount: {
      type: Number,
      default: 0,
      min: [0, "Comments count can't be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to database
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method for comparing passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method for checking if email is verified
userSchema.methods.isEmailVerified = function (): boolean {
  return this.emailVerified;
};

// Method for checking if user is admin
userSchema.methods.isAdmin = function (): boolean {
  return this.role === "admin";
};

// Method for checking if user is moderator
userSchema.methods.isModerator = function (): boolean {
  return this.role === "moderator";
};

// Method for generating verification token
userSchema.methods.generateEmailVerificationToken = function (): string {
  // Random token generation
  const token = crypto.randomBytes(20).toString("hex");
  // Converting token to hashed version to store in database
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  // Setting token expiration time (1 hour)
  this.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000);
  //   Return token
  return token;
};

// Method for generating password reset token
userSchema.methods.generatePasswordResetToken = function (): string {
  // Random token generation
  const token = crypto.randomBytes(20).toString("hex");
  // Converting token to hashed version to store in database
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  // Setting token expiration time (10 minutes)
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  // Return token
  return token;
};

// Don't return __v field in JSON responses
userSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// Indexes for optimizing queries
userSchema.index({
  fullName: "text",
  username: "text",
  bio: "text",
  location: "text",
  email: "text",
});
userSchema.index({ fullName: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ postsCount: -1 });
userSchema.index({ commentsCount: -1 });

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
