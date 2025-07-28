import express from "express";
import {
  createComment,
  getComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create a new comment
/**
 * @swagger
 * /comments/topic/{topicId}:
 *   post:
 *     summary: Create a new comment on a topic
 *     tags: [Comments]
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
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: "Great topic!"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Comment created successfully" }
 *                 comment: { $ref: '#/components/schemas/Comment' }
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
router.post("/topic/:topicId", verifyToken, createComment);

// Get all comments for a topic
/**
 * @swagger
 * /comments/topic/{topicId}:
 *   get:
 *     summary: Get all comments for a topic
 *     tags: [Comments]
 *     parameters:
 *       - name: topicId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Topic ID
 *       - name: page
 *         in: query
 *         schema: { type: integer, example: 1 }
 *         description: Page number (optional)
 *       - name: limit
 *         in: query
 *         schema: { type: integer, example: 10 }
 *         description: Comments per page (optional)
 *       - name: sortBy
 *         in: query
 *         schema: { type: string, example: "createdAt" }
 *         description: Sort field (optional)
 *       - name: sortDir
 *         in: query
 *         schema: { type: string, enum: [asc, desc], example: "desc" }
 *         description: Sort direction (optional)
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Comments retrieved successfully" }
 *                 comments:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Comment' }
 *                 count: { type: integer, example: 10 }
 *                 total: { type: integer, example: 31 }
 *                 totalPages: { type: integer, example: 4 }
 *                 page: { type: integer, example: 1 }
 *       404:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/topic/:topicId", getComments);

// Get a single comment by ID
/**
 * @swagger
 * /comments/{commentId}:
 *   get:
 *     summary: Get a single comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Comment retrieved successfully" }
 *                 comment: { $ref: '#/components/schemas/Comment' }
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:commentId", getComment);

// Update comment
/**
 * @swagger
 * /comments/{commentId}:
 *   patch:
 *     summary: Update a comment by ID
 *     tags: [Comments]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: "Ispravljena poruka"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Comment updated successfully" }
 *                 comment: { $ref: '#/components/schemas/Comment' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/:commentId", verifyToken, updateComment);

// Delete comment
/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Comment deleted successfully" }
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
