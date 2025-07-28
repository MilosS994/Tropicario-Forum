import { body, param } from "express-validator";
import { makeQueryValidator } from "../../utils/makeQueryValidator.js";

const USER_SORT_FIELDS = [
  "createdAt",
  "username",
  "fullName",
  "email",
  "role",
  "status",
  "bannedAt",
  "deletedAt",
];

// VALIDATORS
export const userIdValidator = [
  param("userId").isMongoId().withMessage("Invalid user ID"),
];

export const userQueryValidator = makeQueryValidator(USER_SORT_FIELDS);

export const createUserValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 2, max: 55 })
    .withMessage("Username must be between 2 and 55 characters long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .isLowercase()
    .withMessage("Email can't have capital letters"),
  body("fullName")
    .optional()
    .trim()
    .isLength({ max: 75 })
    .withMessage("Full name can't be more than 75 characters long"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

export const updateUserValidator = [
  body("username")
    .trim()
    .optional()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 2, max: 55 })
    .withMessage("Username must be between 2 and 55 characters long"),
  body("email")
    .trim()
    .optional()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .toLowerCase(),
  body("fullName")
    .optional()
    .trim()
    .isLength({ max: 75 })
    .withMessage("Full name can't be more than 75 characters long"),
  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Biography can't be more than 500 characters long"),
  body("location")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Location can't be more than 100 characters long"),
  body("birthday")
    .optional()
    .isISO8601()
    .withMessage("Birthday must be written in a valid date format"),
];

export const loginUserValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .isLowercase()
    .withMessage("Email can't have capital letters"),
  body("password").notEmpty().withMessage("Password is required"),
];
