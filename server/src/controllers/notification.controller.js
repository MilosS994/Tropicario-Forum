import Notification from "../models/notification.model.js";

// Get notifications
export const getUnreadNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      user: userId,
      isRead: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, user: userId });
    if (!notification) {
      const error = new Error("Notification not found");
      error.status = 404;
      return next(error);
    }

    if (notification.isRead) {
      const error = new Error("Notification already marked as read");
      error.status = 400;
      return next(error);
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
};
