// ======================
// IMPORTS
// ======================
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations/auth";

// ======================
// ROUTE
// ======================
export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    // Zod validation
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { username, email, password } = result.data;

    await connectDB();

    // Check if user already exists
    const existingUser = await User.exists({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          error: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingUsername = await User.exists({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error: ", error);
    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
};
