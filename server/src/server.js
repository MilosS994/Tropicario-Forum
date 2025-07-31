import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import { swaggerSpec, swaggerUi } from "./config/swagger.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import { apiLimiter } from "./middlewares/ratelimiter.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import threadRoutes from "./routes/thread.routes.js";
import sectionRoutes from "./routes/section.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5001"];

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (process.env.NODE_ENV !== "test") {
  app.use("/api/v1", apiLimiter);
}

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/threads", threadRoutes);
app.use("/api/v1/sections", sectionRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/user", notificationRoutes);

app.use(errorMiddleware);

export default app;

// Start server
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5001;
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("Failed to start a server: ", error);
      process.exit(1);
    }
  };
  startServer();
}
