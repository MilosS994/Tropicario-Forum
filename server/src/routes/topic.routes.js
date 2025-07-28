import express from "express";
import {
  createTopic,
  getTopics,
  getTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topic.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import {
  topicIdValidator,
  topicQueryValidator,
  createTopicValidator,
  updateTopicValidator,
} from "../middlewares/validators/topic.validators.js";
import { threadIdValidator } from "../middlewares/validators/thread.validators.js";
import validate from "../middlewares/validate.middleware.js";

const router = express.Router();

// Create a new topic
/**
 * @swagger
 * /topics/thread/{threadId}:
 *   post:
 *     summary: Create a new topic in a thread
 *     tags: [Topics]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: threadId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Thread ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "How to write good topic"
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: "It goes like this..."
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Topic created successfully" }
 *                 topic: { $ref: '#/components/schemas/Topic' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Thread not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post(
  "/thread/:threadId",
  verifyToken,
  threadIdValidator,
  createTopicValidator,
  validate,
  createTopic
);

// Get all topics in a thread
/**
 * @swagger
 * /topics/thread/{threadId}:
 *   get:
 *     summary: Get all topics in a thread
 *     tags: [Topics]
 *     parameters:
 *       - name: threadId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Thread ID
 *       - name: page
 *         in: query
 *         schema: { type: integer, example: 1 }
 *         description: Page number (optional)
 *       - name: limit
 *         in: query
 *         schema: { type: integer, example: 10 }
 *         description: Topics per page (optional)
 *       - name: sortBy
 *         in: query
 *         schema: { type: string, example: "createdAt" }
 *         description: Sort field (optional)
 *       - name: sortDir
 *         in: query
 *         schema: { type: string, enum: [asc, desc], example: "desc" }
 *         description: Sort direction (optional)
 *       - name: q
 *         in: query
 *         schema: { type: string, example: "pravila" }
 *         description: Search topics by title/content (optional)
 *     responses:
 *       200:
 *         description: Topics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Topics retrieved successfully" }
 *                 topics:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Topic' }
 *                 count: { type: integer, example: 10 }
 *                 total: { type: integer, example: 31 }
 *                 totalPages: { type: integer, example: 4 }
 *                 page: { type: integer, example: 1 }
 *       404:
 *         description: Thread not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
  "/thread/:threadId",
  threadIdValidator,
  topicQueryValidator,
  validate,
  getTopics
);

// Get single topic by ID
/**
 * @swagger
 * /topics/{topicId}:
 *   get:
 *     summary: Get a single topic by ID
 *     tags: [Topics]
 *     parameters:
 *       - name: topicId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: Topic retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Topic retrieved successfully" }
 *                 topic: { $ref: '#/components/schemas/Topic' }
 *       404:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:topicId", topicIdValidator, validate, getTopic);

// Update topic
/**
 * @swagger
 * /topics/{topicId}:
 *   patch:
 *     summary: Update a topic by ID
 *     tags: [Topics]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: topicId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Topic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Changed title"
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: "Changed content"
 *     responses:
 *       200:
 *         description: Topic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Topic updated successfully" }
 *                 topic: { $ref: '#/components/schemas/Topic' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch(
  "/:topicId",
  verifyToken,
  topicIdValidator,
  updateTopicValidator,
  validate,
  updateTopic
);

// Delete topic
/**
 * @swagger
 * /topics/{topicId}:
 *   delete:
 *     summary: Delete a topic by ID
 *     tags: [Topics]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: topicId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: Topic deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Topic deleted successfully" }
 *                 topic: { $ref: '#/components/schemas/Topic' }
 *       404:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete(
  "/:topicId",
  verifyToken,
  topicIdValidator,
  validate,
  deleteTopic
);

export default router;
