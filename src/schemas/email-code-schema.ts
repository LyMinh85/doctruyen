import { z } from "zod";

export const emailCodeSchema = z.object({
  code: z.string().min(6, {
    message: "Mã xác thực phải có 6 ký tự",
  }),
})

export type EmailCodeSchema = z.infer<typeof emailCodeSchema>;
