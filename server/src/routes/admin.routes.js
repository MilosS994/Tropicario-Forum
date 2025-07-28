import express from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/admin.middleware.js";
import {
  createSectionValidator,
  updateSectionValidator,
  sectionIdValidator,
} from "../middlewares/validators/section.validators.js";
import {
  createThreadValidator,
  updateThreadValidator,
  threadIdValidator,
} from "../middlewares/validators/thread.validators.js";
import { commentIdValidator } from "../middlewares/validators/comment.validators.js";
import { topicIdValidator } from "../middlewares/validators/topic.validators.js";
import {
  userIdValidator,
  userQueryValidator,
} from "../middlewares/validators/user.validators.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createSection,
  updateSection,
  deleteSection,
  createThread,
  updateThread,
  deleteThread,
  getAllUsers,
  deleteUser,
  banUser,
  unbanUser,
  restoreUser,
  deleteUserPermanently,
  getBannedUsers,
  getDeletedUsers,
  getUserStats,
  closeTopic,
  openTopic,
  deleteTopic,
  togglePin,
  deleteComment,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(verifyToken, isAdmin);

// SECTION
/**
 * @swagger
 * /admin/sections:
 *   post:
 *     summary: Create a new section
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 55
 *                 example: "General"
 *               description:
 *                 type: string
 *                 maxLength: 300
 *                 example: "Palms"
 *               order:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *     responses:
 *       201:
 *         description: Section created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Section created successfully" }
 *                 section: { $ref: '#/components/schemas/Section' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Section with this title already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/sections", createSectionValidator, validate, createSection);
/**
 * @swagger
 * /admin/sections/{sectionId}:
 *   patch:
 *     summary: Update a section
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: sectionId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Section ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 55
 *                 example: "New section name"
 *               description:
 *                 type: string
 *                 maxLength: 300
 *                 example: "New section"
 *               order:
 *                 type: integer
 *                 minimum: 0
 *                 example: 2
 *     responses:
 *       200:
 *         description: Section updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Section updated successfully" }
 *                 section: { $ref: '#/components/schemas/Section' }
 *       404:
 *         description: Section not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Section with this title already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch(
  "/sections/:sectionId",
  sectionIdValidator,
  updateSectionValidator,
  validate,
  updateSection
);
/**
 * @swagger
 * /admin/sections/{sectionId}:
 *   delete:
 *     summary: Delete a section
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: sectionId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Section deleted successfully" }
 *                 section: { $ref: '#/components/schemas/Section' }
 *       404:
 *         description: Section not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete(
  "/sections/:sectionId",
  sectionIdValidator,
  validate,
  deleteSection
);

// THREAD
/**
 * @swagger
 * /admin/threads:
 *   post:
 *     summary: Create a new thread
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, section]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 75
 *                 example: "A thread"
 *               description:
 *                 type: string
 *                 maxLength: 300
 *                 example: "Send threads here"
 *               section:
 *                 type: string
 *                 example: "65c53502c333e43642da66f5"
 *               order:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *     responses:
 *       201:
 *         description: Thread created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Thread created successfully" }
 *                 thread: { $ref: '#/components/schemas/Thread' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Section not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Thread with this title already exists in this section
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/threads", createThreadValidator, validate, createThread);
/**
 * @swagger
 * /admin/threads/{sectionId}/{threadId}:
 *   patch:
 *     summary: Update a thread
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: sectionId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Section ID
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
 *             properties:
 *               title: { type: string, minLength: 3, maxLength: 75, example: "New thread" }
 *               description: { type: string, maxLength: 300, example: "New thread description" }
 *               order: { type: integer, minimum: 0, example: 2 }
 *     responses:
 *       200:
 *         description: Thread updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Thread updated successfully" }
 *                 thread: { $ref: '#/components/schemas/Thread' }
 *       404:
 *         description: Section or thread not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Thread with this title already exists in this section
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch(
  "/threads/:sectionId/:threadId",
  threadIdValidator,
  updateThreadValidator,
  validate,
  updateThread
);
/**
 * @swagger
 * /admin/threads/{sectionId}/{threadId}:
 *   delete:
 *     summary: Delete a thread
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: sectionId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Section ID
 *       - name: threadId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Thread ID
 *     responses:
 *       200:
 *         description: Thread deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Thread deleted successfully" }
 *                 thread: { $ref: '#/components/schemas/Thread' }
 *       404:
 *         description: Section or thread not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete(
  "/threads/:sectionId/:threadId",
  threadIdValidator,
  validate,
  deleteThread
);

// TOPIC
/**
 * @swagger
 * /admin/topics/{topicId}/close:
 *   patch:
 *     summary: Close a topic
 *     tags: [Admin]
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
 *         description: Topic closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Topic closed successfully" }
 *                 topic: { $ref: '#/components/schemas/Topic' }
 *       400:
 *         description: Topic is already closed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/topics/:topicId/close", topicIdValidator, validate, closeTopic);
/**
 * @swagger
 * /admin/topics/{topicId}/open:
 *   patch:
 *     summary: Open a topic
 *     tags: [Admin]
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
 *         description: Topic opened successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Topic opened successfully" }
 *                 topic: { $ref: '#/components/schemas/Topic' }
 *       400:
 *         description: Topic is already opened
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/topics/:topicId/open", topicIdValidator, validate, openTopic);
/**
 * @swagger
 * /admin/topics/{topicId}/toggle-pin:
 *   patch:
 *     summary: Pin/unpin a topic
 *     tags: [Admin]
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
 *         description: Topic pinned or unpinned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message:
 *                   type: string
 *                   example: "Topic pinned"
 *                 topic: { $ref: '#/components/schemas/Topic' }
 *       404:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch(
  "/topics/:topicId/toggle-pin",
  topicIdValidator,
  validate,
  togglePin
);
/**
 * @swagger
 * /admin/topics/{topicId}:
 *   delete:
 *     summary: Delete a topic
 *     tags: [Admin]
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
 *         description: Topic or thread not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete("/topics/:topicId", topicIdValidator, validate, deleteTopic);

// COMMENT
/**
 * @swagger
 * /admin/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Admin]
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
 *         description: Comment or topic not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete(
  "/comments/:commentId",
  commentIdValidator,
  validate,
  deleteComment
);

// USER
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin)
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, example: 1 }
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema: { type: integer, example: 10 }
 *         description: Users per page
 *       - name: sortBy
 *         in: query
 *         schema: { type: string, example: "createdAt" }
 *         description: Sort field
 *       - name: sortDir
 *         in: query
 *         schema: { type: string, enum: [asc, desc], example: "desc" }
 *         description: Sort direction
 *       - name: q
 *         in: query
 *         schema: { type: string, example: "ana" }
 *         description: Filter users by username/email
 *     responses:
 *       200:
 *         description: Users retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Users retrieved successfully" }
 *                 users:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *                 count: { type: integer, example: 10 }
 *                 total: { type: integer, example: 123 }
 *                 totalPages: { type: integer, example: 13 }
 *                 page: { type: integer, example: 1 }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/users", userQueryValidator, validate, getAllUsers);
/**
 * @swagger
 * /admin/users/{userId}/deactivate:
 *   patch:
 *     summary: Deactivate (soft delete) a user
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "User deactivated successfully" }
 *                 user: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       400:
 *         description: User is already deactivated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch(
  "/users/:userId/deactivate",
  userIdValidator,
  validate,
  deleteUser
);
/**
 * @swagger
 * /admin/users/{userId}/restore:
 *   patch:
 *     summary: Restore a deactivated user
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     responses:
 *       200:
 *         description: User restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "User restored successfully" }
 *                 user: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       400:
 *         description: User is not deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/users/:userId/restore", userIdValidator, validate, restoreUser);
/**
 * @swagger
 * /admin/users/{userId}/ban:
 *   patch:
 *     summary: Ban a user
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     responses:
 *       200:
 *         description: User banned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "User banned successfully" }
 *                 user: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       400:
 *         description: User is already banned
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/users/:userId/ban", userIdValidator, validate, banUser);
/**
 * @swagger
 * /admin/users/{userId}/unban:
 *   patch:
 *     summary: Unban a user
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     responses:
 *       200:
 *         description: User unbanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "User unbanned successfully" }
 *                 user: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       400:
 *         description: User is not banned
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/users/:userId/unban", userIdValidator, validate, unbanUser);
/**
 * @swagger
 * /admin/users/{userId}/permanent-delete:
 *   delete:
 *     summary: Permanently delete a user
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted permanently
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "User deleted permanently" }
 *                 user: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete(
  "/users/:userId/permanent-delete",
  userIdValidator,
  validate,
  deleteUserPermanently
);
/**
 * @swagger
 * /admin/users/banned:
 *   get:
 *     summary: Get all banned users
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, example: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, example: 10 }
 *       - name: sortBy
 *         in: query
 *         schema: { type: string, example: "bannedAt" }
 *       - name: sortDir
 *         in: query
 *         schema: { type: string, enum: [asc, desc], example: "desc" }
 *       - name: q
 *         in: query
 *         schema: { type: string, example: "ana" }
 *         description: Filter users by username/email
 *     responses:
 *       200:
 *         description: Banned users retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Banned users retrieved successfully" }
 *                 users:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *                 count: { type: integer, example: 5 }
 *                 total: { type: integer, example: 15 }
 *                 totalPages: { type: integer, example: 2 }
 *                 page: { type: integer, example: 1 }
 */
router.get("/users/banned", userQueryValidator, validate, getBannedUsers);
/**
 * @swagger
 * /admin/users/deleted:
 *   get:
 *     summary: Get all deleted users
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, example: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, example: 10 }
 *       - name: sortBy
 *         in: query
 *         schema: { type: string, example: "deletedAt" }
 *       - name: sortDir
 *         in: query
 *         schema: { type: string, enum: [asc, desc], example: "desc" }
 *       - name: q
 *         in: query
 *         schema: { type: string, example: "ana" }
 *         description: Filter users by username/email
 *     responses:
 *       200:
 *         description: Deleted users retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Deleted users retrieved successfully" }
 *                 users:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *                 count: { type: integer, example: 5 }
 *                 total: { type: integer, example: 15 }
 *                 totalPages: { type: integer, example: 2 }
 *                 page: { type: integer, example: 1 }
 */
router.get("/users/deleted", userQueryValidator, validate, getDeletedUsers);
/**
 * @swagger
 * /admin/users/{userId}/stats:
 *   get:
 *     summary: Get user's statistics (topics/comments count)
 *     tags: [Admin]
 *     security:
 *       - Cookies: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     responses:
 *       200:
 *         description: User statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "User stats retrieved successfully" }
 *                 userId: { type: string, example: "65c534c255e5b841119acdb1" }
 *                 topicsCount: { type: integer, example: 15 }
 *                 commentsCount: { type: integer, example: 100 }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/users/:userId/stats", userIdValidator, validate, getUserStats);

export default router;
