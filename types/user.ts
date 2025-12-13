// =====================
// IMPORTS
// =====================
import mongoose from "mongoose";

// User Status and Role Types
export type UserStatus = "active" | "banned" | "disabled";
export type UserRole = "user" | "moderator" | "admin";

// User Interface
export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  age?: number;
  lastActive: Date;
  postsCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;

  //   Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isEmailVerified(): boolean;
  isAdmin(): boolean;
  isModerator(): boolean;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}
