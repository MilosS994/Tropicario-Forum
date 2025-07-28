import { query } from "express-validator";

// Factory function for query validation
export const makeQueryValidator = (sortFields = []) => [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be a positive integer up to 100"),
  query("sortBy")
    .optional()
    .isIn(sortFields)
    .withMessage(`Invalid sortBy value. Allowed: ${sortFields.join(", ")}`),
  query("sortDir")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort direction must be 'asc' or 'desc'"),
  query("q")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Query can't be more than 50 characters long"),
];
