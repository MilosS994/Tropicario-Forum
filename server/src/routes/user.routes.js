import express from "express";
import upload from "../middlewares/multer.middleware.js";
import {
  updateUser,
  deleteUser,
  changePassword,
  forgotPassword,
  resetPassword,
  uploadAvatar,
} from "../controllers/user.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import {
  changePasswordValidator,
  resetPasswordValidator,
  forgotPasswordValidator,
} from "../middlewares/validators/password.validators.js";
import { updateUserValidator } from "../middlewares/validators/user.validators.js";
import validate from "../middlewares/validate.middleware.js";

const router = express.Router();

// Update user
/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - Cookies: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 55
 *                 example: "john"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               fullName:
 *                 type: string
 *                 maxLength: 75
 *                 example: "John Snow"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "User updated successfully" }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/me", verifyToken, updateUserValidator, validate, updateUser);

// Upload avatar
/**
 * @swagger
 * /users/me/avatar:
 *   patch:
 *     summary: Upload or update current user's avatar
 *     tags: [Users]
 *     security:
 *       - Cookies: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, etc.)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Avatar uploaded successfully" }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: File upload or validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/me/avatar", verifyToken, upload.single("avatar"), uploadAvatar);

// Delete user
/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete current user
 *     tags: [Users]
 *     security:
 *       - Cookies: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "User deleted successfully" }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete("/me", verifyToken, deleteUser);

// Change password
/**
 * @swagger
 * /users/me/password:
 *   patch:
 *     summary: Change current user's password
 *     tags: [Users]
 *     security:
 *       - Cookies: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmNewPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "newpassword456"
 *               confirmNewPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "newpassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Password changed successfully" }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Unauthorized or invalid password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch(
  "/me/password",
  verifyToken,
  changePasswordValidator,
  validate,
  changePassword
);

// Forgot password
/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     summary: Send forgot password email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Password reset link sent" }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validate,
  forgotPassword
);

// Reset password
/**
 * @swagger
 * /users/reset-password/{token}:
 *   post:
 *     summary: Reset user password via reset token
 *     tags: [Users]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Reset token sent by email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword, confirmNewPassword]
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "newpassword456"
 *               confirmNewPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "newpassword456"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Password reset successfully" }
 *       400:
 *         description: Validation error or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post(
  "/reset-password/:token",
  resetPasswordValidator,
  validate,
  resetPassword
);
export default router;
