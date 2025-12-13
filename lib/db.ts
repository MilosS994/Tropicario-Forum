// ======================
// IMPORTS
// ======================
import mongoose from "mongoose";

// ======================
// DATABASE CONNECTION
// ======================

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let URI;

switch (process.env.NODE_ENV) {
  case "production":
    URI = process.env.MONGODB_URI_PROD!;
    break;
  case "development":
    URI = process.env.MONGODB_URI_DEV!;
    break;
  case "test":
    URI = process.env.MONGODB_URI_TEST!;
    break;
  default:
    throw new Error("Invalid NODE_ENV value");
}

if (!URI) {
  throw new Error("MongoDB connection URI is not defined");
}

// Cached connection
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(URI).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
