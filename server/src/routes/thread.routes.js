import express from "express";
import {
  getThreads,
  getThread,
  getAllThreads,
} from "../controllers/thread.controller.js";
import {
  threadIdValidator,
  threadQueryValidator,
} from "../middlewares/validators/thread.validators.js";
import { sectionIdValidator } from "../middlewares/validators/section.validators.js";
import validate from "../middlewares/validate.middleware.js";

const router = express.Router();

// Get all threads in a forum
router.get("/all", threadQueryValidator, validate, getAllThreads);

//  Get all threads in a section
router.get(
  "/:sectionId",
  sectionIdValidator,
  threadQueryValidator,
  validate,
  getThreads
);

// Get a single thread
router.get(
  "/:sectionId/:threadId",
  sectionIdValidator,
  threadIdValidator,
  validate,
  getThread
);

export default router;
