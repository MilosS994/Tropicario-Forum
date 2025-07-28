import Section from "../models/section.model.js";

// Get all sections
export const getSections = async (req, res, next) => {
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

    const sections = await Section.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Section.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Sections retrieved successfully",
      sections,
      count: sections.length,
      total,
      totalPages,
      page,
    });
  } catch (error) {
    next(error);
  }
};

// Get single section
export const getSection = async (req, res, next) => {
  try {
    const { sectionId } = req.params;

    const section = await Section.findById(sectionId);
    if (!section) {
      const error = new Error("Section not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Section retrieved successfully",
      section,
    });
  } catch (error) {
    next(error);
  }
};
