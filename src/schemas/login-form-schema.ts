import { z } from "zod";

// Schema validate user đăng ký
export const loginFormSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

// Tự động tạo TypeScript type từ schema
export type LoginFormSchema = z.infer<typeof loginFormSchema>;
