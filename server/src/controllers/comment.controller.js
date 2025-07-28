import Comment from "../models/comment.model.js";
import Topic from "../models/topic.model.js";

// Create a new comment
export const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const topicId = req.params.topicId;
    const userId = req.user._id;

    if (!userId) {
      const error = new Error("User not authenticated");
      error.status = 401;
      return next(error);
    }

    if (!content || content.trim() === "") {
      const error = new Error("Comment content is required");
      error.status = 400;
      return next(error);
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      const error = new Error("Topic not found");
      error.status = 404;
      return next(error);
    }

    const comment = await Comment.create({
      content,
      author: userId,
      topic: topicId,
    });

    comment.populate("author", "username avatar");

    topic.commentsCount += 1;
    await topic.save();

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// Get all comments for a topic
export const getComments = async (req, res, next) => {
  const { topicId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "createdAt";
  const sortDir = req.query.sortDir === "asc" ? 1 : -1;
  const q = req.query.q?.trim();

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      const error = new Error("Topic not found");
      error.status = 404;
      return next(error);
    }

    const query = { topic: topicId };
    if (q) {
      query.content = { $regex: q, $options: "i" };
    }

    const total = await Comment.countDocuments(query);

    const totalPages = Math.ceil(total / limit);

    const comments = await Comment.find(query)
      .sort({ [sortBy]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "username avatar");

    res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      comments,
      count: comments.length,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single comment
export const getComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId).populate(
      "author",
      "username avatar"
    );
    if (!comment) {
      const error = new Error("Comment not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Comment retrieved successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// Update a comment
export const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      const error = new Error("Comment not found");
      error.status = 404;
      return next(error);
    }

    if (!content || content.trim() === "") {
      const error = new Error("Comment content is required");
      error.status = 400;
      return next(error);
    }

    if (comment.author.toString() !== userId.toString()) {
      const error = new Error("You are not authorized to update this comment");
      error.status = 403;
      return next(error);
    }

    comment.content = content;
    await comment.save();

    await comment.populate("author", "username avatar");

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a comment
export const deleteComment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      const error = new Error("Comment not found");
      error.status = 404;
      return next(error);
    }

    if (comment.author.toString() !== userId.toString()) {
      const error = new Error("You are not authorized to delete this comment");
      error.status = 403;
      return next(error);
    }

    await comment.deleteOne();

    const topic = await Topic.findById(comment.topic);
    if (topic && topic.commentsCount > 0) {
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
