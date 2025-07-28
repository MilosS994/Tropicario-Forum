import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = async (req, res, next) => {
  const { token } = req.cookies;

  try {
    if (!token) {
      const error = new Error("No token provided");
      error.status = 401;
      return next(error);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user || user.status === "banned" || user.status === "deleted") {
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default verifyToken;
