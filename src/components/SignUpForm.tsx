"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import Link from "next/link";
import {
  signUpFormSchema,
  SignUpFormSchema,
} from "@/schemas/sign-up-form-schema";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Gender } from "@prisma/client";
import { OAuthButtons } from "./OAuthButtons";
import { useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { EmailCodeSchema, emailCodeSchema } from "@/schemas/email-code-schema";
import { cn } from "@/lib/utils";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { getGenderLabel } from "@/enums/gender";

export default function SignUpForm() {
  const form = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const emailCodeForm = useForm<EmailCodeSchema>({
    resolver: zodResolver(emailCodeSchema),
    defaultValues: {
      code: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verifying, setVerifying] = useState(false);
  const [userData, setUserData] = useState({});
  const { user } = useUser();
  const router = useRouter();

  async function onSubmit(values: SignUpFormSchema) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    if (!isLoaded) return;

    // Start the sign-up process using the email and password provided
    try {
      await signUp.create({
        emailAddress: values.email,
        password: values.password,
      });

      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Set 'verifying' true to display second form
      // and capture the OTP code
      setVerifying(true);
      setUserData({
        email: values.email,
        password: values.password,
        username: values.username,
        gender: values.gender,
      });
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      if (isClerkAPIResponseError(err)) {
        form.setError("root", {
          type: "manual",
          message: err.errors[0].longMessage,
        });
      }

      console.error(JSON.stringify(err, null, 2));
    }
  }

  // Handle the submission of the verification form
  const handleVerify = async (values: EmailCodeSchema) => {
    if (!isLoaded) return;
    const { code } = values;
    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

        await fetch("/api/auth/sign-up", {
          method: "POST",
          body: JSON.stringify({
            ...userData,
            authProviderId: signUpAttempt.createdUserId,
            authProvider: "Clerk",
            avatarUrl: user && user.imageUrl,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }).then((res) => res.json());
        router.push("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      if (isClerkAPIResponseError(err)) {
        emailCodeForm.setError("code", {
          type: "manual",
          message: err.errors[0].longMessage,
        });
      }
      console.error("Error:", JSON.stringify(err, null, 2));
    }
  };

  if (verifying) {
    return (
      <Form {...emailCodeForm}>
        <form
          onSubmit={emailCodeForm.handleSubmit(handleVerify)}
          className="w-full space-y-6 flex flex-col justify-center items-center"
          // no autoComplete to prevent autofill
          autoComplete="off"
        >
          <FormField
            control={emailCodeForm.control}
            name="code"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormLabel>Mã xác thực</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                  Vui lòng kiểm tra email và nhập mã xác thực
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Xác nhận</Button>
        </form>
      </Form>
    );
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Alice85" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="alice@email.com" {...field} />
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
              <FormLabel>Password</FormLabel>
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

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giới tính</FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex space-x-2"
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  {Object.values(Gender).map((gender: Gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <RadioGroupItem value={gender} id={gender} />
                      <Label htmlFor={gender}>{getGenderLabel(gender)}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className={cn("text-destructive text-sm font-medium")}>
          {form.formState.errors.root?.message}
        </p>

        {/* CAPTCHA Widget */}
        <div id="clerk-captcha"></div>

        <Button
          type="submit"
          variant="default"
          size="default"
          className="w-full"
        >
          Đăng ký
        </Button>

        <div className="text-center text-sm">
          <span className="text-gray-600">Bạn đã có sẵn tài khoản? </span>
          <Link
            href="/auth/login"
            className="text-gray-800 font-semibold hover:text-gray-600 transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </form>
    </Form>
  );
}
