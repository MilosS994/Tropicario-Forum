import User from "../models/user.model.js";
import Section from "../models/section.model.js";
import Thread from "../models/thread.model.js";
import Topic from "../models/topic.model.js";
import Comment from "../models/comment.model.js";
import { slugify } from "../utils/slugify.js";

// SECTION
// Create section
export const createSection = async (req, res, next) => {
  try {
    const { title, description, order } = req.body;

    const slug = slugify(title); // Generate slug

    // Check if there is a section with the same slug
    const sectionExists = await Section.exists({ slug });
    if (sectionExists) {
      const error = new Error("Section with this title already exists");
      error.status = 409;
      return next(error);
    }

    const section = await Section.create({
      title,
      description,
      slug,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: "Section created successfully",
      section,
    });
  } catch (error) {
    next(error);
  }
};

// Update section
export const updateSection = async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const { title, description, order } = req.body;

    const section = await Section.findById(sectionId);
    if (!section) {
      const error = new Error("Section not found");
      error.status = 404;
      return next(error);
    }

    if (title && title !== section.title) {
      const slug = slugify(title);
      const sectionExists = await Section.exists({ slug });
      if (sectionExists) {
        const error = new Error("Section with this title already exists");
        error.status = 409;
        return next(error);
      }
      section.title = title;
      section.slug = slug;
    }

    if (description !== undefined) {
      section.description = description;
    }

    if (order !== undefined) {
      section.order = order;
    }

    await section.save();

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      section,
    });
  } catch (error) {
    next(error);
  }
};

// Delete section
export const deleteSection = async (req, res, next) => {
  try {
    const { sectionId } = req.params;

    const section = await Section.findById(sectionId);
    if (!section) {
      const error = new Error("Section not found");
      error.status = 404;
      return next(error);
    }

    // Find all threads in section
    const threads = await Thread.find({ section: sectionId });
    const threadIds = threads.map((thread) => thread._id);
    // Find all topics in the threads
    const topicIds = await Topic.find({ thread: { $in: threadIds } }).distinct(
      "_id"
    );
    // Delete all comments from the topics, topics from the threads, and threads from the section
    await Promise.all([
      Comment.deleteMany({ topic: { $in: topicIds } }),
      Topic.deleteMany({ thread: { $in: threadIds } }),
      Thread.deleteMany({ section: sectionId }),
    ]);

    const deletedSection = section.toObject();
    await section.deleteOne();

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      section: deletedSection,
    });
  } catch (error) {
    next(error);
  }
};

// THREAD
// Create thread
export const createThread = async (req, res, next) => {
  try {
    const { title, description, section, order } = req.body;

    // Check if there is a section
    const foundSection = await Section.findById(section);
    if (!foundSection) {
      const error = new Error("Section not found");
      error.status = 404;
      return next(error);
    }

    const slug = slugify(title); // Generate slug

    // Check if there is a thread with the same slug and section
    const threadExists = await Thread.exists({ slug, section });
    if (threadExists) {
      const error = new Error(
        "Thread with this title already exists in this section"
      );
      error.status = 409;
      return next(error);
    }

    const thread = await Thread.create({
      title,
      description,
      section,
      slug,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: "Thread created successfully",
      thread,
    });
  } catch (error) {
    next(error);
  }
};

// Update thread
export const updateThread = async (req, res, next) => {
  try {
    const { sectionId, threadId } = req.params;
    const { title, description, order } = req.body;

    const sectionExists = await Section.exists({ _id: sectionId });
    if (!sectionExists) {
      const error = new Error("Section not found");
      error.status = 404;
      return next(error);
    }

    const thread = await Thread.findOne({
      _id: threadId,
      section: sectionId,
    });

    if (!thread) {
      const error = new Error("Thread not found");
      error.status = 404;
      return next(error);
    }

    if (title && title !== thread.title) {
      const slug = slugify(title);
      const threadExists = await Thread.exists({
        slug,
        section: sectionId,
        _id: { $ne: threadId },
      });

      if (threadExists) {
        const error = new Error(
          "Thread with this title already exists in this section"
        );
        error.status = 409;
        return next(error);
      }

      thread.title = title;
      thread.slug = slug;
    }

    if (description !== undefined) {
      thread.description = description;
    }
    if (order !== undefined) {
      thread.order = order;
    }

    await thread.save();
    await thread.populate("section", "name slug");

    res.status(200).json({
      success: true,
      message: "Thread updated successfully",
      thread,
    });
  } catch (error) {
    next(error);
  }
};

// Delete thread
export const deleteThread = async (req, res, next) => {
  try {
    const { sectionId, threadId } = req.params;

    const sectionExists = await Section.exists({ _id: sectionId });
    if (!sectionExists) {
      const error = new Error("Section not found");
      error.status = 404;
      return next(error);
    }

    const thread = await Thread.findOne({
      _id: threadId,
      section: sectionId,
    });
    if (!thread) {
      const error = new Error("Thread not found");
      error.status = 404;
      return next(error);
    }

    const topicIds = await Topic.find({ thread: threadId }).distinct("_id");

    await Promise.all([
      Comment.deleteMany({ topic: { $in: topicIds } }),
      Topic.deleteMany({ thread: threadId }),
    ]);

    const deletedThread = thread.toObject(); // Just in case we want to return deleted thread for frontend
    await thread.deleteOne();

    res.status(200).json({
      success: true,
      message: "Thread deleted successfully",
      thread: deletedThread,
    });
  } catch (error) {
    next(error);
  }
};

// TOPIC
// Close topic
export const closeTopic = async (req, res, next) => {
  const { topicId } = req.params;
  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      const error = new Error("Topic not found");
      error.status = 404;
      return next(error);
    }

    if (topic.closed === true) {
      const error = new Error("Topic is already closed");
      error.status = 400;
      return next(error);
    }

    topic.closed = true;
    await topic.save();

    res
      .status(200)
      .json({ success: true, message: "Topic closed successfully", topic });
  } catch (error) {
    next(error);
  }
};

// Open topic
export const openTopic = async (req, res, next) => {
  const { topicId } = req.params;
  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      const error = new Error("Topic not found");
      error.status = 404;
      return next(error);
    }

    if (topic.closed === false) {
      const error = new Error("Topic is already opened");
      error.status = 400;
      return next(error);
    }

    topic.closed = false;
    await topic.save();

    res
      .status(200)
      .json({ success: true, message: "Topic opened successfully", topic });
  } catch (error) {
    next(error);
  }
};

// Pin/unpin topic (togglePin)
export const togglePin = async (req, res, next) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      const error = new Error("Topic not found");
      error.status = 404;
      return next(error);
    }

    topic.pinned = !topic.pinned;

    await topic.save();

    res.status(200).json({
      success: true,
      message: topic.pinned ? "Topic pinned" : "Topic unpinned",
      topic,
    });
  } catch (error) {
    next(error);
  }
};

// Delete topic
export const deleteTopic = async (req, res, next) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      const error = new Error("Topic not found");
      error.status = 404;
      return next(error);
    }

    const thread = await Thread.findById(topic.thread);
    if (!thread) {
      const error = new Error("Thread not found");
      error.status = 404;
      return next(error);
    }

    const deletedTopic = topic.toObject(); // Just in case we need it for frontend

    await Promise.all([
      Comment.deleteMany({ topic: topicId }),
      topic.deleteOne(),
    ]);

    if (thread.topicsCount > 0) {
      thread.topicsCount -= 1;
    }

    await thread.save();

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully",
      topic: deletedTopic,
    });
  } catch (error) {
    next(error);
  }
};

// COMMENT
export const deleteComment = async (req, res, next) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      const error = new Error("Comment not found");
      error.status = 404;
      return next(error);
    }

    const topic = await Topic.findById(comment.topic);
    if (!topic) {
      const error = new Error("Topic not found");
      error.status = 404;
      return next(error);
    }

    await comment.deleteOne();

    if (topic.commentsCount > 0) {
      topic.commentsCount -= 1;
      await topic.save();
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// USER
// Get all users
export const getAllUsers = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "createdAt";
  const sortDir = req.query.sortDir === "asc" ? 1 : -1;
  const q = req.query.q?.trim();

  try {
    const query = {};
    if (q) {
      query.$or = [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password -__v")
      .sort({ [sortBy]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
      count: users.length,
      total,
      totalPages,
      page,
    });
  } catch (error) {
    next(error);
  }
};

// Ban user
export const banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    if (user.status === "banned") {
      const error = new Error("User is already banned");
      error.status = 400;
      return next(error);
    }

    user.status = "banned";
    user.bannedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "User banned successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Unban user
export const unbanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    if (user.status !== "banned") {
      const error = new Error("User is not banned");
      error.status = 400;
      return next(error);
    }

    user.status = "active";
    user.bannedAt = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User unbanned successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    if (user.status === "deleted") {
      const error = new Error("User is already deactivated");
      error.status = 400;
      return next(error);
    }

    // Keep original user data
    user.anonymizedBackup = {
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      lastLogin: user.lastLogin,
      birthday: user.birthday,
    };

    // Anonymize data
    user.status = "deleted";
    user.deletedAt = new Date();
    user.email = null;
    user.username = `deleted${user._id}`;
    user.fullName = null;
    user.avatar = "";
    user.bio = "";
    user.location = "";
    user.lastLogin = null;
    user.birthday = null;

    await user.save();

    const deletedUser = user.toObject();

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      user: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Permanently delete user from database
export const deleteUserPermanently = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    const deletedUser = user.toObject();

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted permanently",
      user: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Restore user
export const restoreUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    if (user.status !== "deleted") {
      const error = new Error("User is not deleted");
      error.status = 400;
      return next(error);
    }

    if (user.anonymizedBackup) {
      user.email = user.anonymizedBackup.email;
      user.username = user.anonymizedBackup.username;
      user.fullName = user.anonymizedBackup.fullName;
      user.avatar = user.anonymizedBackup.avatar;
      user.bio = user.anonymizedBackup.bio;
      user.location = user.anonymizedBackup.location;
      user.lastLogin = user.anonymizedBackup.lastLogin;
      user.birthday = user.anonymizedBackup.birthday;
      user.anonymizedBackup = null;
    }
    user.status = "active";
    user.deletedAt = null;

    await user.save();

    const restoredUser = user.toObject();

    res.status(200).json({
      success: true,
      message: "User restored successfully",
      user: restoredUser,
    });
  } catch (error) {
    next(error);
  }
};

// Get all banned users
export const getBannedUsers = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "bannedAt";
  const sortDir = req.query.sortDir === "asc" ? 1 : -1;
  const q = req.query.q?.trim();

  try {
    const query = { status: "banned" };
    if (q) {
      query.$or = [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .sort({ [sortBy]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Banned users retrieved successfully",
      users,
      count: users.length,
      total,
      totalPages,
      page,
    });
  } catch (error) {
    next(error);
  }
};

// Get all deleted users
export const getDeletedUsers = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "deletedAt";
  const sortDir = req.query.sortDir === "asc" ? 1 : -1;
  const q = req.query.q?.trim();

  try {
    const query = { status: "deleted" };
    if (q) {
      query.$or = [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .sort({ [sortBy]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Deleted users retrieved successfully",
      users,
      count: users.length,
      total,
      totalPages,
      page,
    });
  } catch (error) {
    next(error);
  }
};

// Get user stats
export const getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const topicsCount = await Topic.countDocuments({ author: userId });
    const commentsCount = await Comment.countDocuments({ author: userId });

    res.status(200).json({
      success: true,
      message: "User stats retrieved successfully",
      userId,
      topicsCount,
      commentsCount,
    });
  } catch (error) {
    next(error);
  }
};
