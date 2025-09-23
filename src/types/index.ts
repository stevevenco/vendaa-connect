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
  is_sandbox: boolean;
  is_verified: boolean;
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
    phone_code: z.string().optional(),
    phone_number: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.phone_number && !data.phone_code) {
        return false;
      }
      return true;
    },
    {
      message: "Country code is required",
      path: ["phone_code"],
    }
  )
  .refine(
    (data) => {
      if (data.phone_code && !data.phone_number) {
        return false;
      }
      return true;
    },
    {
      message: "Phone number is required",
      path: ["phone_number"],
    }
  );

export type TRegisterSchema = z.infer<typeof RegisterSchema>;

export interface RegisterResponse {
  email: string;
  first_name: string;
  last_name: string;
  phone_code: string | null;
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
  phone_code: string | null;
  phone_number: string | null;
  organizations: Organization[];
  is_verified: boolean;
  display_state: "test" | "live";
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
  role: z.enum([
    "owner",
    "admin",
    "member",
    "auditor",
    "finance_manager",
    "operations_manager",
    "support_agent",
    "developer",
  ]),
});

export type TAddMemberSchema = z.infer<typeof AddMemberSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: z.enum([
    "admin",
    "member",
    "owner",
    "auditor",
    "finance_manager",
    "operations_manager",
    "support_agent",
    "developer",
  ]),
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

export interface PaginatedResponse<T> {
  links: {
    next: string | null;
    previous: string | null;
  };
  count: number;
  total_pages: number;
  results: T[];
}

export interface Transaction {
  transaction_id: string;
  title: string;
  amount: string;
  status: string;
  event: string;
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

export const CreateMeterSchema = z
  .object({
    customer_name: z.string().min(1, "Customer name is required"),
    meter_number: z
      .string()
      .regex(/^\d+$/, "Meter number must contain only digits")
      .min(1, "Meter number is required"),
    email: z.string().email("Invalid email address"),
    phone_code: z.string().optional(),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
  sgc: z
    .string()
    .regex(/^\d{6}$/, "SGC must be exactly 6 digits"),
  tariff_index: z
    .string()
    .regex(/^\d{1,2}$/, "Tariff index must be 1–2 digits")
    .refine((val) => {
      const num = Number(val);
      return num >= 1 && num <= 99;
    }, "Tariff index must be between 1 and 99"),
  key_revision_number: z
    .string()
    .regex(/^\d$/, "Key revision number must be a single digit")
    .refine((val) => {
      const num = Number(val);
      return num >= 1 && num <= 2;
    }, "Key revision number must be 1 or 2"),
  meter_type: z.enum(["electricity", "water", "gas"]),
})
.refine(
    (data) => {
      if (data.phone && !data.phone_code) {
        return false;
      }
      return true;
    },
    {
      message: "Country code is required",
      path: ["phone_code"],
    }
  );

export type TCreateMeterSchema = z.infer<typeof CreateMeterSchema>;

export const UpdateMeterSchema = CreateMeterSchema.omit({
  meter_number: true,
}).partial();

export type TUpdateMeterSchema = z.infer<typeof UpdateMeterSchema>;

export const GenerateTokenSchema = z
  .object({
    token_type: z.enum([
      "credit",
      "kct",
      "mse",
      "clear_credit",
      "clear_tamper",
      "test",
      "ditk",
      "mgtk",
    ]),
    meter_number: z.string().min(1, "Meter number is required"),
    amount: z.coerce.number().optional(),
    utility_units: z.coerce.number().optional(),
    subclass: z.number().optional(),
    operation: z.string().optional(),
    action: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.token_type === "credit") {
      const hasAmount = data.amount !== undefined && data.amount >= 1;
      const hasUnits =
        data.utility_units !== undefined && data.utility_units >= 1;

      if (!hasAmount && !hasUnits) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: "Either amount (at least 1) or units (at least 1) must be provided.",
        });
      }
      if (hasAmount && hasUnits) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: "Please provide either amount or units, but not both.",
        });
      }
    }
    if (data.token_type === "mgtk") {
      if (!data.operation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["operation"],
          message: "Operation is required",
        });
      }
      if (!data.action) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["action"],
          message: "Action is required",
        });
      }
    }
  });

export type TGenerateTokenSchema = z.infer<typeof GenerateTokenSchema>;

export interface GenerateTokenRequest {
  token_type:
    | "credit"
    | "kct"
    | "mse"
    | "clear_credit"
    | "clear_tamper"
    | "test"
    | "ditk"
    | "mgtk";
  meter_number: string;
  amount?: number;
  utility_units?: number;
  subclass?: number;
  operation?: string;
  action?: string;
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

export interface UtilityCost {
  uuid: string;
  name: string;
  cost: string;
  created: string;
  last_updated: string;
}