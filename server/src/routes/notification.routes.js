import express from "express";
import {
  getUnreadNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET UNREAD NOTIFICATIONS
router.get("/notifications/unread", verifyToken, getUnreadNotifications);

// MARK AS READ
router.patch("/notifications/:id/read", verifyToken, markAsRead);

export default router;
