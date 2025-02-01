"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { LoginFormSchema } from "@/schemas/login-form-schema";
import Link from "next/link";
import { OAuthButtons } from "./OAuthButtons";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export default function LoginForm() {
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  async function onSubmit(values: LoginFormSchema) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: values.email,
        password: values.password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        // If the error is from the Clerk API, you can handle it here
        form.setError("root", {
          type: "manual",
          message: err.errors[0].longMessage,
        })
      }
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <OAuthButtons />
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-300 w-full"></div>
          <span className="bg-white px-2 text-sm text-gray-500 absolute">
            Hoặc
          </span>
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors no-underline"
                >
                  Quên mật khẩu
                </a>
              </div>

              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="default"
          size="default"
          className="w-full"
        >
          Đăng nhập
        </Button>

        <div className="text-center text-sm">
          <span className="text-gray-600">Không có tài khoản? </span>
          <Link
            href="/auth/sign-up"
            className="text-gray-800 font-semibold hover:text-gray-600 transition-colors"
          >
            Đăng ký
          </Link>
        </div>
      </form>
    </Form>
  );
}
