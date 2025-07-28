import { body, param } from "express-validator";
import mongoose from "mongoose";
import { makeQueryValidator } from "../../utils/makeQueryValidator.js";

// ObjectID validation helper
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const THREAD_SORT_FIELDS = ["createdAt", "title", "order", "topicsCount"];

// VALIDATORS
export const threadIdValidator = [
  param("threadId").isMongoId().withMessage("Invalid thread ID"),
];

export const threadQueryValidator = makeQueryValidator(THREAD_SORT_FIELDS);

export const createThreadValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Thread title is required")
    .isLength({ min: 3, max: 75 })
    .withMessage("Thread title must be between 3 and 75 characters long"),
  body("description")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Thread description can't be more than 300 characters long"),
  body("section")
    .notEmpty()
    .withMessage("Section is required")
    .custom(isObjectId)
    .withMessage("Section must be a valid ID"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a positive integer"),
];

export const updateThreadValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 75 })
    .withMessage("Thread title must be between 3 and 75 characters long"),
  body("description")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Thread description can't be more than 300 characters long"),
  body("section")
    .optional()
    .custom(isObjectId)
    .withMessage("Section must be a valid ID"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a positive integer"),
];
