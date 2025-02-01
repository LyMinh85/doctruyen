import { Gender } from "@prisma/client";
import { z } from "zod";

export const signUpFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  gender: z.enum([Gender.FEMALE, Gender.MALE, Gender.SECRECY]),
});

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;
