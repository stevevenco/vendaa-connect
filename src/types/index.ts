import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export type TLoginSchema = z.infer<typeof LoginSchema>;

export interface AuthResponse {
  refresh: string;
  access: string;
}

export const RegisterSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
    confirmPassword: z.string(),
    first_name: z.string().min(1, {
      message: "First name is required.",
    }),
    last_name: z.string().min(1, {
      message: "Last name is required.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type TRegisterSchema = z.infer<typeof RegisterSchema>;

export interface RegisterResponse {
  email: string;
  first_name: string;
  last_name: string;
}

export const OtpVerifySchema = z.object({
  otp_code: z.string().min(6, {
    message: "OTP must be 6 characters long.",
  }),
  purpose: z.string().default("signup"),
});

export type TOtpVerifySchema = z.infer<typeof OtpVerifySchema>;

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, {
    message: "Organization name is required.",
  }),
});

export type TCreateOrganizationSchema = z.infer<
  typeof CreateOrganizationSchema
>;

export interface Organization {
  uuid: string;
  name: string;
  role: string;
}

export interface User {
  email: string;
  first_name: string;
  last_name: string;
  organizations: Organization[];
}
