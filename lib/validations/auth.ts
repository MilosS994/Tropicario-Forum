import { z } from "zod";

// ===================
// REGISTER SCHEMA
// ===================
export const registerSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters long")
    .max(55, "Username can't be more than 55 characters")
    .regex(
      /^[\w-]+$/,
      "Username can only contain letters, numbers, hyphens and underscores"
    ),

  email: z.email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .refine((password) => /[A-Z]/.test(password), {
      message: "Password must contain an uppercase letter",
    })
    .refine((password) => /[a-z]/.test(password), {
      message: "Password must contain a lowercase letter",
    })
    .refine((password) => /[0-9]/.test(password), {
      message: "Password must contain a number",
    })
    .refine((password) => /[!@#$%^&*()]/.test(password), {
      message: "Password must contain a special character",
    }),
});

// ===================
// LOGIN SCHEMA
// ===================
export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// ===================
// TYPES
// ===================
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
