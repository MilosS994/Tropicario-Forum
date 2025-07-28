import { body, param } from "express-validator";
import mongoose from "mongoose";
import { makeQueryValidator } from "../../utils/makeQueryValidator.js";

// ObjectID validation helper
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const TOPIC_SORT_FIELDS = ["createdAt", "title", "views", "commentsCount"];

// VALIDATORS
export const topicIdValidator = [
  param("topicId").isMongoId().withMessage("Invalid topic ID"),
];

export const topicQueryValidator = makeQueryValidator(TOPIC_SORT_FIELDS);

export const createTopicValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Topic title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Topic title must be between 3 and 100 characters long"),
  body("content")
    .notEmpty()
    .withMessage("Topic content is required")
    .isLength({ min: 1 })
    .withMessage("Topic content must be at least 1 character long"),
];

export const updateTopicValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Topic title must be between 3 and 100 characters long"),
  body("content")
    .optional()
    .isLength({ min: 1 })
    .withMessage("Topic content must be at least 1 character long"),
];
