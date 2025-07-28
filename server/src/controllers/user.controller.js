import crypto from "crypto";
import cloudinary from "../utils/cloudinary.js";
import { getCloudinaryPublicId } from "../utils/cloudinary.js";
import { resetPasswordTemplate } from "../utils/emailTemplates.js";
import User from "../models/user.model.js";
import { sendMail } from "../utils/mail.js";

// Update user info
export const updateUser = async (req, res, next) => {
  const { username, fullName, email, bio, location, birthday } = req.body;
  const userId = req.user._id;
  try {
    if (
      !(
        req.body.hasOwnProperty("username") ||
        req.body.hasOwnProperty("fullName") ||
        req.body.hasOwnProperty("email") ||
        req.body.hasOwnProperty("bio") ||
        req.body.hasOwnProperty("location") ||
        req.body.hasOwnProperty("birthday")
      )
    ) {
      const error = new Error(
        "At least one field needs to be provided for update"
      );
      return next(error);
    }

    const updates = {};

    if (req.body.hasOwnProperty("username")) {
      if (username && username !== req.user.username) {
        const exists = await User.exists({ username, _id: { $ne: userId } });
        if (exists) {
          const error = new Error("Username already taken");
          error.status = 400;
          return next(error);
        }
      }
      updates.username = username;
    }

    if (req.body.hasOwnProperty("email")) {
      if (email && email !== req.user.email) {
        const exists = await User.exists({ email, _id: { $ne: userId } });
        if (exists) {
          const error = new Error("Email already in use");
          error.status = 400;
          return next(error);
        }
      }
      updates.email = email;
    }

    if (req.body.hasOwnProperty("fullName")) {
      updates.fullName = fullName;
    }
    if (req.body.hasOwnProperty("bio")) {
      updates.bio = bio;
    }
    if (req.body.hasOwnProperty("location")) {
      updates.location = location;
    }
    if (req.body.hasOwnProperty("birthday")) {
      updates.birthday = birthday;
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  const userId = req.user._id;
  try {
    await User.findByIdAndDelete(userId);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "None",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error("Incorrect current password");
      error.status = 400;
      return next(error);
    }

    if (currentPassword === newPassword) {
      const error = new Error(
        "New password must be different from current password"
      );
      error.status = 400;
      return next(error);
    }

    user.password = newPassword;
    await user.save();

    // Logout after changing password
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "None",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  const isDevOrTest = ["development", "test"].includes(process.env.NODE_ENV);
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ success: true, message: "If user exists, reset link sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hash;
    user.passwordResetExpires = Date.now() + 1000 * 60 * 15; // 15 min

    await user.save();

    // Frontend URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = resetPasswordTemplate({
      username: user.username,
      resetUrl,
      expireMins: 15,
    });

    // Send email
    await sendMail({
      to: user.email,
      subject: "Reset your password | Tropicario Forum",
      html,
    });

    // Just for development, instead of email
    res.status(200).json({
      success: true,
      message: "If user exists, reset link sent",
      ...(isDevOrTest ? { resetToken } : {}),
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    if (!token) {
      const error = new Error("Token is required");
      error.status = 401;
      return next(error);
    }

    const hash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hash,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("Invalid or expired reset token");
      error.status = 401;
      return next(error);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

// Upload avatar
export const uploadAvatar = async (req, res, next) => {
  const userId = req.user._id;

  try {
    if (!req.file) {
      const error = new Error("No file uploaded");
      error.status = 400;
      return next(error);
    }

    console.log("REQ FILE:", req.file);

    const user = await User.findById(userId);

    if (user.avatar) {
      const publicId = getCloudinaryPublicId(user.avatar);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error(
            "Error deleting old avatar from Cloudinary:",
            err.message
          );
        }
      }
    }

    cloudinary.uploader
      .upload_stream(
        {
          folder: "tropicario_forum/avatars",
          resource_type: "image",
        },
        async (error, result) => {
          if (error) return next(error);
          const user = await User.findByIdAndUpdate(
            userId,
            { avatar: result.secure_url },
            { new: true }
          );
          const { password: _, ...userWithoutPassword } = user.toObject();

          res.status(200).json({
            success: true,
            message: "Avatar uploaded successfully",
            avatarUrl: result.secure_url,
            user: userWithoutPassword,
          });
        }
      )
      .end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};
