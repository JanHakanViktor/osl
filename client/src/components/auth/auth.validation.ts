import { z } from "zod";

const username = z
  .string()
  .trim()
  .min(4, "Username must be at least 4 characters")
  .max(24, "Username cannot exceed 24 characters");

const password = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[0-9]/, "Password must contain a digit");

export const signInSchema = z.object({
  username,
  password,
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  username,
  password,
  drivername: z
    .string()
    .trim()
    .min(4, "Driver name must be at least 4 characters")
    .max(24, "Driver name cannot exceed 24 characters")
    .regex(/^[A-Za-z]+ [A-Za-z]+$/, "Please enter only First and Last name"),
  country: z.string().min(1, "Selecting country is required"),
  teamId: z.string().nullable().refine(Boolean, {
    message: "Selecting a team is required",
  }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
