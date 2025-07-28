import { jest } from "@jest/globals";
jest.unstable_mockModule("../src/utils/mail.js", () => ({
  sendMail: jest.fn(),
}));

import request from "supertest";
import connectDB from "../src/config/db.js";
import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const app = (await import("../src/server.js")).default;
const mailUtil = await import("../src/utils/mail.js");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("User actions", () => {
  let cookies;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await User.deleteMany();
    await User.create({
      email: "user@mail.com",
      username: "user",
      password: "user1234",
    });
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user1234" });
    cookies = loginRes.headers["set-cookie"];
  });

  afterAll(async () => {
    mongoose.connection.close();
  });

  //   User update
  test("should update user", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me")
      .send({ username: "NewUsername" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User updated successfully");
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe("NewUsername");
  });

  //   User update validation - existing email
  test("should not update user if providing already taken email", async () => {
    await request(app).post("/api/v1/auth/register").send({
      email: "user1@mail.com",
      username: "user1",
      password: "user1234",
    });

    const res = await request(app)
      .patch("/api/v1/users/me")
      .send({ email: "user1@mail.com" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email already in use");
    expect(res.body.success).toBe(false);
  });

  //   User update validation - existing username
  test("should not update user if providing already taken username", async () => {
    await request(app).post("/api/v1/auth/register").send({
      email: "user1@mail.com",
      username: "user1",
      password: "user1234",
    });

    const res = await request(app)
      .patch("/api/v1/users/me")
      .send({ username: "user1" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Username already taken");
    expect(res.body.success).toBe(false);
  });

  //   User update validation - no token
  test("should not update user without authorization", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me")
      .send({ username: "NewUsername" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("No token provided");
  });

  //   User update validation - invalid birthday date
  test("should not update user if providing invalid birthday date format", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me")
      .send({ birthday: "07/11/2011" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.birthday).toBe(
      "Birthday must be written in a valid date format"
    );
    expect(res.body.success).toBe(false);
  });

  //   Delete user account
  test("should delete existing user's account", async () => {
    const res = await request(app)
      .delete("/api/v1/users/me")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User account deleted successfully");
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toContain("token=;");

    cookies = undefined;
  });

  //   Upload avatar
  test("should upload user avatar", async () => {
    const filePath = join(__dirname, "assets", "test-avatar.jpg");

    const res = await request(app)
      .patch("/api/v1/users/me/avatar")
      .set("Cookie", cookies)
      .attach("avatar", filePath);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Avatar uploaded successfully");
    expect(res.body.avatarUrl).toBeDefined();
    expect(res.body.user.avatar).toBeDefined();
  });

  //   Change password
  test("should change user password to new one", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me/password")
      .send({
        currentPassword: "user1234",
        newPassword: "user12345",
        confirmNewPassword: "user12345",
      })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Password updated successfully");
  });

  //   Change password validation - wrong current password
  test("should not change user password to new one if the current password is invalid", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me/password")
      .send({
        currentPassword: "user12345",
        newPassword: "user123456",
        confirmNewPassword: "user123456",
      })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Incorrect current password");
  });

  //   Change password validation - new password not confirmed
  test("should not change user password to new one if the current password is invalid", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me/password")
      .send({
        currentPassword: "user1234",
        newPassword: "user12345",
        confirmNewPassword: "user123",
      })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.confirmNewPassword).toBe("Passwords do not match");
  });

  //   Change password validation - new password same as old one
  test("should not change user password to new one if the current password is invalid", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me/password")
      .send({
        currentPassword: "user1234",
        newPassword: "user1234",
        confirmNewPassword: "user1234",
      })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(
      "New password must be different from current password"
    );
  });

  //   Forgot password
  test("should send reset token for existing user", async () => {
    const res = await request(app)
      .post("/api/v1/users/forgot-password")
      .send({ email: "user@mail.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("If user exists, reset link sent");
    if (["development", "test"].includes(process.env.NODE_ENV)) {
      expect(res.body.resetToken).toBeDefined();
    } else {
      expect(res.body.resetToken).toBeUndefined();
    }
    expect(mailUtil.sendMail).toHaveBeenCalledTimes(1);
  });

  //   Reset password
  test("should reset a password with valid token", async () => {
    // Trigger forgot password first
    const forgotRes = await request(app)
      .post("/api/v1/users/forgot-password")
      .send({ email: "user@mail.com" });

    expect(forgotRes.statusCode).toBe(200);
    expect(forgotRes.body.resetToken).toBeDefined();

    const resetToken = forgotRes.body.resetToken;

    // Fetch user from db
    const user = await User.findOne({ email: "user@mail.com" });
    if (["development", "test"].includes(process.env.NODE_ENV)) {
      expect(forgotRes.body.resetToken).toBeDefined();
    } else {
      expect(forgotRes.body.resetToken).toBeUndefined();
    }
    expect(user.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());

    const newPassword = "newpassword";
    const resetRes = await request(app)
      .post(`/api/v1/users/reset-password/${resetToken}`)
      .send({
        newPassword,
        confirmNewPassword: newPassword,
      });

    expect(resetRes.statusCode).toBe(200);
    expect(resetRes.body.success).toBe(true);
    expect(resetRes.body.message).toBe("Password reset successful");

    // Check if tokens are removed and password changed
    const updatedUser = await User.findOne({ email: "user@mail.com" });
    expect(updatedUser.passwordResetToken).toBeUndefined();
    expect(updatedUser.passwordResetExpires).toBeUndefined();
    expect(await updatedUser.comparePassword(newPassword)).toBe(true);
  });

  //   Reset password validation with invalid token
  test("should not reset password with invalid token", async () => {
    const invalidToken = "notavalidtoken";

    const newPassword = "newpassword";

    const res = await request(app)
      .post(`/api/v1/users/reset-password/${invalidToken}`)
      .send({
        newPassword,
        confirmNewPassword: "newpassword",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid or expired reset token");
  });

  //   Reset password validaton - no new password provided
  test("should not reset a password without providing new password", async () => {
    // Trigger forgot password first
    const forgotRes = await request(app)
      .post("/api/v1/users/forgot-password")
      .send({ email: "user@mail.com" });

    expect(forgotRes.statusCode).toBe(200);
    expect(forgotRes.body.resetToken).toBeDefined();

    const resetToken = forgotRes.body.resetToken;

    // Fetch user from db
    const user = await User.findOne({ email: "user@mail.com" });
    if (["development", "test"].includes(process.env.NODE_ENV)) {
      expect(forgotRes.body.resetToken).toBeDefined();
    } else {
      expect(forgotRes.body.resetToken).toBeUndefined();
    }
    expect(user.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());

    const resetRes = await request(app).post(
      `/api/v1/users/reset-password/${resetToken}`
    );

    expect(resetRes.statusCode).toBe(400);
    expect(resetRes.body.success).toBe(false);
    expect(resetRes.body.errors.newPassword).toBe("New password is required");
  });

  //   Reset password validation - wrong confirm password
  test("should not reset a password without confirming new password", async () => {
    // Trigger forgot password first
    const forgotRes = await request(app)
      .post("/api/v1/users/forgot-password")
      .send({ email: "user@mail.com" });

    expect(forgotRes.statusCode).toBe(200);
    expect(forgotRes.body.resetToken).toBeDefined();

    const resetToken = forgotRes.body.resetToken;

    // Fetch user from db
    const user = await User.findOne({ email: "user@mail.com" });
    if (["development", "test"].includes(process.env.NODE_ENV)) {
      expect(forgotRes.body.resetToken).toBeDefined();
    } else {
      expect(forgotRes.body.resetToken).toBeUndefined();
    }
    expect(user.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());

    const newPassword = "newpassword";
    const resetRes = await request(app)
      .post(`/api/v1/users/reset-password/${resetToken}`)
      .send({
        newPassword,
      });

    expect(resetRes.statusCode).toBe(400);
    expect(resetRes.body.success).toBe(false);
    expect(resetRes.body.errors.confirmNewPassword).toBe(
      "You need to confirm new password"
    );
  });
});
