import express from "express";
import { getSections, getSection } from "../controllers/section.controller.js";
import {
  sectionQueryValidator,
  sectionIdValidator,
} from "../middlewares/validators/section.validators.js";
import validate from "../middlewares/validate.middleware.js";

const router = express.Router();

// Get all sections
/**
 * @swagger
 * /sections:
 *   get:
 *     summary: Get all forum sections
 *     tags: [Sections]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, example: 1 }
 *         description: Page number (optional)
 *       - name: limit
 *         in: query
 *         schema: { type: integer, example: 10 }
 *         description: Sections per page (optional)
 *       - name: sortBy
 *         in: query
 *         schema: { type: string, example: "order" }
 *         description: Sort field (optional)
 *       - name: sortDir
 *         in: query
 *         schema: { type: string, enum: [asc, desc], example: "asc" }
 *         description: Sort direction (optional)
 *       - name: q
 *         in: query
 *         schema: { type: string, example: "ideje" }
 *         description: Search sections by title (optional)
 *     responses:
 *       200:
 *         description: Sections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Sections retrieved successfully" }
 *                 sections:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Section' }
 *                 count: { type: integer, example: 4 }
 *                 total: { type: integer, example: 10 }
 *                 totalPages: { type: integer, example: 1 }
 *                 page: { type: integer, example: 1 }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/", sectionQueryValidator, validate, getSections);

// Get single section by id
/**
 * @swagger
 * /sections/{sectionId}:
 *   get:
 *     summary: Get a single section by ID
 *     tags: [Sections]
 *     parameters:
 *       - name: sectionId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Section retrieved successfully" }
 *                 section: { $ref: '#/components/schemas/Section' }
 *       404:
 *         description: Section not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:sectionId", sectionIdValidator, validate, getSection);

export default router;
