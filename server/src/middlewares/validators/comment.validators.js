import { body, param } from "express-validator";
import mongoose from "mongoose";
import { makeQueryValidator } from "../../utils/makeQueryValidator.js";

// ObjectID validation helper
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const COMMENT_SORT_FIELDS = ["createdAt"];

// COMMENT VALIDATORS
export const commentIdValidator = [
  param("commentId").isMongoId().withMessage("Invalid comment ID"),
];

export const commentQueryValidator = makeQueryValidator(COMMENT_SORT_FIELDS);

export const createCommentValidator = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ min: 1 })
    .withMessage("Comment content must be at least 1 character long"),
  body("topic")
    .notEmpty()
    .withMessage("Topic is required")
    .custom(isObjectId)
    .withMessage("Topic must be a valid ID"),
];

export const updateCommentValidator = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ min: 1 })
    .withMessage("Comment content must be at least 1 character long"),
];
