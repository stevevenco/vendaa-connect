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

// Define Organization early because other interfaces use it
export interface Organization {
  uuid: string;
  name: string;
  created_by: string;
  created: string;
  country: string; // Country UUID
  currency: string;
  role?: string;
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
    phone_number: z.string().optional(),
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
  phone_number: string;
  organizations: Organization[];
}

export const RequestOtpSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  purpose: z.enum(["signup", "password_reset"]),
});

export type TRequestOtpSchema = z.infer<typeof RequestOtpSchema>;

export const OtpVerifySchema = z.object({
  email: z.string().email(),
  otp_code: z.string().min(6, {
    message: "OTP must be 6 characters long.",
  }),
  purpose: z.enum(["signup", "password_reset"]),
  new_password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }).optional(),
});

export type TOtpVerifySchema = z.infer<typeof OtpVerifySchema>;

export const UpdateProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  phone_number: z.string().optional(),
});

export type TUpdateProfileSchema = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z
  .object({
    old_password: z.string(),
    new_password: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export type TChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, {
    message: "Organization name is required.",
  }),
  country: z.string().uuid({ message: "Country is required." }),
});

export type TCreateOrganizationSchema = z.infer<
  typeof CreateOrganizationSchema
>;

export interface User {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  organizations: Organization[];
}

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1, {
    message: "Organization name is required.",
  }),
});

export type TUpdateOrganizationSchema = z.infer<
  typeof UpdateOrganizationSchema
>;

export interface MemberUser {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
}

export interface OrganizationMember {
  uuid: string;
  user: MemberUser;
  role: string;
  joined_at: string;
  invited_by: string;
}

export const AddMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "member"]),
});

export type TAddMemberSchema = z.infer<typeof AddMemberSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member", "owner"]),
});

export type TUpdateMemberRoleSchema = z.infer<typeof UpdateMemberRoleSchema>;

export interface OrganizationInvite {
  token: string;
  email: string;
  role: string;
  organization_name: string;
  organization_uuid: string;
  sent_by_email: string;
  sent_by_name: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created: string;
  expires_at: string;
}

export interface BasePaymentOption {
  payment_gateway: string;
  slug: string;
  logo: string;
  amount: string;
  fee: string;
  provider: string;
}

export interface OnlineCheckoutPaymentOption extends BasePaymentOption {
  payment_url: string;
}

export interface BankTransferPaymentOption extends BasePaymentOption {
  bank_name: string;
  icon: string;
  account_number: string;
  account_name: string;
  account_reference: string;
}

export type PaymentOption = OnlineCheckoutPaymentOption | BankTransferPaymentOption;

export interface Transaction {
  transaction_id: string;
  title: string;
  amount: string;
  status: string;
  created_at: string;
}

export interface Meter {
  uuid: string;
  customer_name: string;
  meter_number: string;
  email: string;
  phone: string;
  address: string;
  sgc: string;
  tariff_index: string;
  key_revision_number: string;
  meter_type: "electricity" | "water" | "gas";
  added_by: string;
  organization: string;
  created: string;
  last_updated: string;
}

export const CreateMeterSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  meter_number: z.string().min(1, "Meter number is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  sgc: z.string().min(1, "SGC is required"),
  tariff_index: z.string().min(1, "Tariff index is required"),
  key_revision_number: z.string().min(1, "Key revision number is required"),
  meter_type: z.enum(["electricity", "water", "gas"]),
});

export type TCreateMeterSchema = z.infer<typeof CreateMeterSchema>;

export interface GenerateTokenRequest {
  token_type: "kct" | "credit" | "clear_credit";
  meter_number: string;
  amount: number;
}

export interface CreditTokenResponse {
  token: string;
}

export interface KctToken {
  description: string;
  token: string;
}

export type KctTokenResponse = KctToken[];

export type TokenResponse = CreditTokenResponse | KctTokenResponse;

// API Key related types
export interface ApiKey {
  uuid: string;
  key_id: string;
  key_type: "public" | "secret";
  key_type_display: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  scopes: string[];
}

export const CreateApiKeySchema = z.object({
  name: z.string().min(3, "API key name must be at least 3 characters long"),
  key_type: z.enum(["public", "secret"]),
});
export type TCreateApiKeySchema = z.infer<typeof CreateApiKeySchema>;

export interface CreateApiKeyResponse extends Omit<ApiKey, 'last_used_at'> {
  full_key: string;
}