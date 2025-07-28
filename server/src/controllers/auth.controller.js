import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";

// Register new user
export const register = async (req, res, next) => {
  const { username, fullName, email, password } = req.body;

  try {
    const existingUsername = await User.exists({ username });
    if (existingUsername) {
      const error = new Error("Username already taken");
      error.status = 400;
      return next(error);
    }

    const existingUser = await User.exists({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.status = 400;
      return next(error);
    }

    if (!process.env.JWT_SECRET) {
      const error = new Error("Server config error: JWT_SECRET missing!");
      error.status = 500;
      return next(error);
    }

    const user = await User.create({
      username,
      fullName,
      email,
      password,
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "None",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      return next(error);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      return next(error);
    }

    if (user.status === "banned") {
      const error = new Error("Your account is banned");
      error.status = 403;
      return next(error);
    }

    if (user.status === "deleted") {
      const error = new Error("Your account is deleted");
      error.status = 403;
      return next(error);
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "None",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "None",
      path: "/",
    });

    res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// Get logged user info
export const getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      const error = new Error("Not authorized");
      error.status = 401;
      return next(error);
    }

    const { password: _, ...userWithoutPassword } = req.user.toObject();

    res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};
