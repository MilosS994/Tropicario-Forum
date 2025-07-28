const errorMiddleware = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Internal server error";

  // If client is not allowed by CORS
  if (err.message && err.message.startsWith("Not allowed by CORS")) {
    status = 403;
    message: err.message;
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    status = 404;
    message = `Resource not found with id of ${err.value}`;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with that ${field} already exists.`;
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Hide the details in production if status is 500
  if (status === 500 && process.env.NODE_ENV === "production") {
    message = "An internal server error occurred. Please try again later.";
  }

  console.error(`[${new Date().toISOString()}] ERROR caught by middleware on path: ${
    req.path
  }\n
  Status code: ${status}\n
  Message: ${message}
  `);

  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(status).json({ success: false, message });
};

export default errorMiddleware;
