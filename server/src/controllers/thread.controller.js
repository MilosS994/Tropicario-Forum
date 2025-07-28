import Thread from "../models/thread.model.js";
import Section from "../models/section.model.js";

// Get all threads in the forum
export const getAllThreads = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "createdAt";
  const sortDir = req.query.sortDir === "asc" ? 1 : -1;
  const q = req.query.q?.trim();

  try {
    const query = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const threads = await Thread.find(query)
      .sort({ [sortBy]: sortDir })
      .populate("section", "name slug")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Thread.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Threads retrieved successfully",
      threads,
      count: threads.length,
      total,
      totalPages,
      page,
    });
  } catch (error) {
    next(error);
  }
};

// Get all threads in a section
export const getThreads = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "createdAt";
  const sortDir = req.query.sortDir === "asc" ? 1 : -1;
  const q = req.query.q?.trim();
  const { sectionId } = req.params;

  try {
    const sectionExists = await Section.exists({ _id: sectionId });
    if (!sectionExists) {
      const error = new Error("Section not found");
      error.status = 404;
      return next(error);
    }

    const query = { section: sectionId };
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const threads = await Thread.find(query)
      .sort({ [sortBy]: sortDir })
      .populate("section", "name slug")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Thread.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Threads retrieved successfully",
      threads,
      count: threads.length,
      total,
      totalPages,
      page,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single thread
export const getThread = async (req, res, next) => {
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
    }).populate("section", "name slug");

    if (!thread) {
      const error = new Error("Thread not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Thread retrieved successfully",
      thread,
    });
  } catch (error) {
    next(error);
  }
};
