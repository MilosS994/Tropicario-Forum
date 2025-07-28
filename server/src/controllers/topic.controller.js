import Topic from "../models/topic.model.js";
import Comment from "../models/comment.model.js";
import Thread from "../models/thread.model.js";
import { slugify } from "../utils/slugify.js";

// Create a new topic
export const createTopic = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const { threadId } = req.params;
    const author = req.user._id;

    if (!title || !content) {
      const error = new Error("Title and content are required");
      error.status = 400;
      return next(error);
    }

    const threadExists = await Thread.findById(threadId);
    if (!threadExists) {
      const error = new Error("Thread not found");
      error.status = 404;
      return next(error);
    }

    const slug = slugify(title);
    const topicExists = await Topic.findOne({ slug, thread: threadId });
    if (topicExists) {
      const error = new Error(
        "A topic with this title already exists in this thread"
      );
      error.status = 409;
      return next(error);
    }

    const topic = await Topic.create({
      title,
      content,
      thread: threadId,
      author,
      slug,
    });

    await topic.populate([
      { path: "author", select: "username" },
      { path: "thread", select: "title" },
    ]);

    res.status(201).json({
      success: true,
      message: "Topic created successfully",
      topic,
    });
  } catch (error) {
    next(error);
  }
};

// Get all topics in a thread
export const getTopics = async (req, res, next) => {
  const { threadId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "createdAt";
  const sortDir = req.query.sortDir === "asc" ? 1 : -1;
  const q = req.query.q?.trim();

  try {
    const thread = await Thread.findById(threadId);
    if (!thread) {
      const error = new Error("Thread not found");
      error.status = 404;
      return next(error);
    }

    const query = { thread: threadId };
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const total = await Topic.countDocuments(query);

    const topics = await Topic.find(query)
      .sort({ [sortBy]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate([
        { path: "author", select: "username avatar" },
        { path: "thread", select: "title" },
      ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Topics retrieved successfully",
      topics,
      count: topics.length,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

// Get single topic by ID
export const getTopic = async (req, res, next) => {
  const { topicId } = req.params;
  try {
    const topic = await Topic.findById(topicId).populate([
      {
        path: "author",
        select: "username",
      },
    ]);

    if (!topic) {
      const error = new Error("Topic not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Topic retrieved successfully",
      topic,
    });
  } catch (error) {
    next(error);
  }
};

// Update a topic
export const updateTopic = async (req, res, next) => {
  const { topicId } = req.params;
  const { title, content } = req.body;
  const userId = req.user._id;

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      const error = new Error("Topic not found");
      error.status = 404;
      return next(error);
    }

    if (topic.author.toString() !== userId.toString()) {
      const error = new Error("You are not authorized to update this topic");
      error.status = 403;
      return next(error);
    }

    if (!title && !content) {
      const error = new Error("Title or content are required");
      error.status = 400;
      return next(error);
    }

    if (title === topic.title && content === topic.content) {
      const error = new Error("You haven't made any changes");
      error.status = 400;
      return next(error);
    }

    if (title && title !== topic.title) {
      const slug = slugify(title);
      const topicExists = await Topic.findOne({
        slug,
        thread: topic.thread,
        _id: { $ne: topicId },
      });
      if (topicExists) {
        const error = new Error(
          "A topic with this title already exists in this thread"
        );
        error.status = 409;
        return next(error);
      }
      topic.title = title;
      topic.slug = slug;
    }

    if (content) topic.content = content;

    await topic.save();
    await topic.populate([{ path: "author", select: "username" }]);

    res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      topic,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a topic
export const deleteTopic = async (req, res, next) => {
  const { topicId } = req.params;
  const userId = req.user._id;

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      const error = new Error("Topic not found");
      error.status = 404;
      return next(error);
    }

    if (topic.author.toString() !== userId.toString()) {
      const error = new Error("You are not authorized to delete this topic");
      error.status = 403;
      return next(error);
    }

    const deletedTopic = topic.toObject();
    const thread = await Thread.findById(topic.thread);

    await Comment.deleteMany({ topic: topicId });
    await topic.deleteOne();
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
