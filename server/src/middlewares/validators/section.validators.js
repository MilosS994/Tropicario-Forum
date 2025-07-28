import { body, param } from "express-validator";
import { makeQueryValidator } from "../../utils/makeQueryValidator.js";

const SECTION_SORT_FIELDS = ["createdAt", "title", "order"];

// VALIDATORS
export const sectionIdValidator = [
  param("sectionId").isMongoId().withMessage("Invalid section ID"),
];

export const sectionQueryValidator = makeQueryValidator(SECTION_SORT_FIELDS);

export const createSectionValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Section title is required")
    .isLength({ min: 2, max: 55 })
    .withMessage("Section title must be between 2 and 55 characters long"),
  body("description")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Section description can't be more than 300 characters long"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a positive integer"),
];

export const updateSectionValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 55 })
    .withMessage("Section title must be between 2 and 55 characters long"),
  body("description")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Section description can't be more than 300 characters long"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a positive integer"),
];
