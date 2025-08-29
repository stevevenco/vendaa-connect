import {
  TLoginSchema,
  AuthResponse,
  TRegisterSchema,
  RegisterResponse,
  TOtpVerifySchema,
  User,
  TCreateOrganizationSchema,
  Organization,
  TRequestOtpSchema,
  TUpdateProfileSchema,
  TChangePasswordSchema,
  TUpdateOrganizationSchema,
  OrganizationMember,
  TAddMemberSchema,
  TUpdateMemberRoleSchema,
} from "@/types";

const LOCAL_API_URL: string = "http://localhost:8000";
const STAGING_API_URL: string = "https://vendaa-be.onrender.com";
const PRODUCTION_API_URL: string = "https://api.example.com";
const API_VERSION: string = "api/v1";

const env: string = import.meta.env.VITE_ENV || "staging";
let API_URL: string = "";
if (env === "development") {
  API_URL = LOCAL_API_URL;
} else if (env === "staging") {
  API_URL = STAGING_API_URL;
} else {
  API_URL = PRODUCTION_API_URL;
}

const getAuthToken: () => string | null = () => localStorage.getItem("access");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const api = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_URL}${url}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    const message =
      errorData.detail ||
      (errorData.non_field_errors && errorData.non_field_errors[0]) ||
      (errorData.email && errorData.email[0]) ||
      (errorData.error && errorData.error[0]) ||
      "Dang! Something went wrong, I wish I could explain, but I don't want to bore you with the details, check back later I promise to have it fixed. 💚";
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

const authApi = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  return api<T>(url, { ...options, headers });
};

export const login = (credentials: TLoginSchema): Promise<AuthResponse> => {
  return api<AuthResponse>(`/${API_VERSION}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
};

export const register = (
  data: TRegisterSchema
): Promise<RegisterResponse> => {
  return api<RegisterResponse>(`/${API_VERSION}/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const updateOrganization = (
  orgId: string,
  data: TUpdateOrganizationSchema
): Promise<Organization> => {
  return authApi<Organization>(`/${API_VERSION}/auth/organizations/${orgId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const getOrganizationMembers = (
  orgId: string
): Promise<OrganizationMember[]> => {
  return authApi<OrganizationMember[]>(`/${API_VERSION}/auth/organizations/${orgId}/members/`);
};

export const addOrganizationMember = (
  organizationUuid: string,
  data: TAddMemberSchema
): Promise<{ email: string; role: string }> => {
  return authApi<{ email: string; role: string }>(`/${API_VERSION}/auth/organizations/${organizationUuid}/members/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateMemberRole = (
  orgUuid: string,
  memberUuid: string,
  data: TUpdateMemberRoleSchema
): Promise<{ role: string }> => {
  return authApi<{ role: string }>(`/${API_VERSION}/auth/organizations/${orgUuid}/members/${memberUuid}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const removeMember = (
  orgUuid: string,
  memberUuid: string
): Promise<void> => {
  return authApi<void>(`/${API_VERSION}/auth/organizations/${orgUuid}/members/${memberUuid}/`, {
    method: "DELETE",
  });
};

export const getInvitations = (type: 'sent' | 'received' = 'received'): Promise<OrganizationInvite[]> => {
  return authApi<OrganizationInvite[]>(`/${API_VERSION}/auth/invitations/?type=${type}`);
};

export const verifyInvitation = (token: string): Promise<OrganizationInvite> => {
  return authApi<OrganizationInvite>(`/${API_VERSION}/auth/invites/verify/?token=${token}`);
};

export const acceptInvitation = (token: string): Promise<{ detail: string }> => {
  return authApi<{ detail: string }>(`/${API_VERSION}/auth/invites/accept/`, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
};

export const declineInvitation = (invitationId: string): Promise<{ detail: string }> => {
  return authApi<{ detail: string }>(`/${API_VERSION}/auth/invites/${invitationId}/decline/`, {
    method: "POST"
  });
};

export const cancelInvitation = (invitationId: string): Promise<{ detail: string }> => {
  return authApi<{ detail: string }>(`/${API_VERSION}/auth/invites/${invitationId}/cancel/`, {
    method: "POST"
  });
};

export const requestOtp = (data: TRequestOtpSchema): Promise<void> => {
  return api<void>(`/${API_VERSION}/auth/request-otp/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const verifyOtp = (data: TOtpVerifySchema): Promise<void> => {
  return api<void>(`/${API_VERSION}/auth/otp-verify/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const getMe = (): Promise<User> => {
  return authApi<User>(`/${API_VERSION}/auth/me/`);
};

export const updateProfile = (data: TUpdateProfileSchema): Promise<User> => {
  return authApi<User>(`/${API_VERSION}/auth/me/update/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const changePassword = (data: TChangePasswordSchema): Promise<void> => {
  return authApi<void>(`/${API_VERSION}/auth/change-password/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const createOrganization = (
  data: TCreateOrganizationSchema
): Promise<Organization> => {
  return authApi<Organization>(`/${API_VERSION}/auth/organizations/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Wallet Related Endpoints
export const getWalletBalance = (organizationId: string): Promise<{ balance: string }> => {
  return authApi<{ balance: string }>(`/${API_VERSION}/wallet/balance/${organizationId}/`);
};

export const createWallet = (organization_id: string): Promise<any> => {
  return authApi<any>(`/${API_VERSION}/wallet/create/`, {
    method: "POST",
    body: JSON.stringify({ organization_id }),
  });
};

export const initiateWalletFunding = (
  organizationId: string,
  paymentOption: 'online_checkout' | 'bank_transfer',
  amount: number
): Promise<PaymentOption[]> => {
  return authApi<PaymentOption[]>(
    `/${API_VERSION}/wallet/initiate-payment/${organizationId}?payment_option=${paymentOption}&amount=${amount}`
  );
};
