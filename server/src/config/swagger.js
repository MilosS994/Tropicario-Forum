import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import pkg from "../../package.json" with { type: "json" };
const { version } = pkg;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tropicario Forum API",
      version,
      description: "REST API documentation for Tropicario Forum",
    },
    servers: [
      {
        url: "http://localhost:5001/api/v1",
      },
    ],
    components: {
      securitySchemes: {
        Cookies: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT token within the cookie (httpOnly)",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65c53502c333e43642da66f2" },
            username: { type: "string", example: "tropicario" },
            fullName: { type: "string", example: "Tropicario User" },
            email: { type: "string", example: "user@example.com" },
            avatar: { type: "string", example: "" },
            bio: { type: "string", example: "Forum user!" },
            location: { type: "string", example: "London" },
            status: {
              type: "string",
              enum: ["active", "banned", "deleted"],
              example: "active",
            },
            bannedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: null,
            },
            deletedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: null,
            },
            lastLogin: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: null,
            },
            birthday: {
              type: "string",
              format: "date",
              nullable: true,
              example: null,
            },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-03-20T18:10:43.924Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-03-20T18:10:43.924Z",
            },
          },
        },
        Section: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65c53502c333e43642da66f5" },
            title: {
              type: "string",
              minLength: 2,
              maxLength: 55,
              example: "General Discussion",
            },
            description: {
              type: "string",
              maxLength: 300,
              example: "All themes and general discussion",
            },
            order: { type: "integer", minimum: 0, example: 1 },
            slug: { type: "string", example: "general-discussion" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-07-14T12:34:56.789Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-07-14T12:34:56.789Z",
            },
          },
        },
        Thread: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65c53c2a1d67d241ba776f71" },
            title: {
              type: "string",
              minLength: 3,
              maxLength: 75,
              example: "A thread",
            },
            description: {
              type: "string",
              maxLength: 300,
              example: "Send threads here",
            },
            section: { type: "string", example: "65c53502c333e43642da66f5" },
            topicsCount: { type: "integer", example: 5 },
            slug: { type: "string", example: "a-thread" },
            order: { type: "integer", example: 2 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Topic: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65c54051a9d1a1b82c9f482e" },
            title: {
              type: "string",
              minLength: 3,
              maxLength: 100,
              example: "First post",
            },
            content: { type: "string", minLength: 1, example: "Welcome!" },
            thread: { type: "string", example: "65c53c2a1d67d241ba776f71" },
            author: { type: "string", example: "65c534c255e5b841119acdb1" },
            slug: { type: "string", example: "first-post" },
            views: { type: "integer", example: 12 },
            commentsCount: { type: "integer", example: 2 },
            pinned: { type: "boolean", example: false },
            closed: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65c540fb9eaeab6d4d47e61a" },
            content: { type: "string", minLength: 1, example: "Slažem se!" },
            author: { type: "string", example: "65c534c255e5b841119acdb1" },
            topic: { type: "string", example: "65c54051a9d1a1b82c9f482e" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "... error description" },
          },
        },
      },
    },
  },
  apis: ["src/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };
