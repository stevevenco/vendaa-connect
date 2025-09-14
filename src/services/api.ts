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
  Meter,
  TCreateMeterSchema,
  GenerateTokenRequest,
  TokenResponse,
  ApiKey,
  CreateApiKeyResponse,
  OrganizationInvite,
  PaymentOption,
  Transaction,
  TCreateApiKeySchema,
} from "@/types";

const LOCAL_API_URL: string = import.meta.env.VITE_LOCAL_API_URL || "http://localhost:8000";
const STAGING_API_URL: string = import.meta.env.VITE_STAGING_API_URL || "https://vendaa-be.onrender.com";
const PRODUCTION_API_URL: string = import.meta.env.VITE_PRODUCTION_API_URL || "https://api.example.com";
const API_VERSION: string = import.meta.env.VITE_API_VERSION || "api/v1";

const env: string = import.meta.env.VITE_ENV || "development";

let API_URL: string = "";
if (env === "development") {
  API_URL = LOCAL_API_URL;
} else if (env === "staging") {
  API_URL = STAGING_API_URL;
} else {
  API_URL = PRODUCTION_API_URL;
}

const getAuthToken = (): string | null => localStorage.getItem("access");
const getRefreshToken = (): string | null => localStorage.getItem("refresh");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const api = async <T>(
  url: string,
  options: RequestInit = {},
  useApiVersion: boolean = true
): Promise<T> => {
  const requestUrl = useApiVersion
    ? `${API_URL}/${API_VERSION}${url}`
    : `${API_URL}/${API_VERSION}${url}`;
  const response = await fetch(requestUrl, options);

  if (!response.ok) {
    const errorData = await response.json();
    const message =
      errorData.detail ||
      (errorData.non_field_errors && errorData.non_field_errors[0]) ||
      (errorData.email && errorData.email[0]) ||
      (errorData.error && errorData.error[0]) ||
      "Dang! Something went wrong.";
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};


const authApi = async <T>(
  url: string,
  options: RequestInit = {},
  useApiVersion: boolean = true,
): Promise<T> => {
  let token = getAuthToken();

  // Check if token is expired (simplified check)
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      try {
        const newTokens = await refreshToken();
        token = newTokens.access;
        localStorage.setItem('access', newTokens.access);
      } catch (error) {
        // Handle refresh token failure (e.g., logout user)
        console.error("Failed to refresh token", error);
        // window.location.href = '/login'; // Or dispatch a logout action
        return Promise.reject("Session expired. Please log in again.");
      }
    }
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  return api<T>(url, { ...options, headers }, useApiVersion);
};

export const login = (credentials: TLoginSchema): Promise<AuthResponse> => {
  return api<AuthResponse>(`/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  }, false);
};

export const refreshToken = (): Promise<{ access: string }> => {
  const refresh = getRefreshToken();
  return api<{ access: string }>(`/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  }, false);
};

export const register = (
  data: TRegisterSchema
): Promise<RegisterResponse> => {
  // Omit confirmPassword before sending
  const { confirmPassword, ...payload } = data;
  return api<RegisterResponse>(`/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }, false);
};

export const getOrganizations = (): Promise<Organization[]> => {
  return authApi<Organization[]>(`/auth/organizations/`, {}, false);
};

export const updateOrganization = (
  orgId: string,
  data: TUpdateOrganizationSchema
): Promise<{name: string}> => {
  return authApi<{name: string}>(`/auth/organizations/${orgId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }, false);
};

export const deleteOrganization = (orgId: string): Promise<void> => {
  return authApi<void>(`/auth/organizations/${orgId}/`, {
    method: 'DELETE',
  }, false);
};

export const getOrganizationMembers = (
  orgId: string
): Promise<OrganizationMember[]> => {
  return authApi<OrganizationMember[]>(`/auth/organizations/${orgId}/members/`, {}, false);
};

export const getOrganizationMember = (orgUuid: string, memberUuid: string): Promise<OrganizationMember> => {
  return authApi<OrganizationMember>(`/auth/organizations/${orgUuid}/members/${memberUuid}/`, {}, false);
};

export const addOrganizationMember = (
  organizationUuid: string,
  data: TAddMemberSchema
): Promise<{ email: string; role: string }> => {
  return authApi<{ email: string; role: string }>(`/auth/organizations/${organizationUuid}/members/`, {
    method: "POST",
    body: JSON.stringify(data),
  }, false);
};

export const updateMemberRole = (
  orgUuid: string,
  memberUuid: string,
  data: TUpdateMemberRoleSchema
): Promise<OrganizationMember> => {
  return authApi<OrganizationMember>(`/auth/organizations/${orgUuid}/members/${memberUuid}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }, false);
};

export const removeMember = (
  orgUuid: string,
  memberUuid: string
): Promise<void> => {
  return authApi<void>(`/auth/organizations/${orgUuid}/members/${memberUuid}/`, {
    method: "DELETE",
  }, false);
};

export const getInvitations = (type: 'sent' | 'received' = 'received', orgUuid: string): Promise<OrganizationInvite[]> => {
  return authApi<OrganizationInvite[]>(`/auth/organizations/${orgUuid}/invitations/?type=${type}`, {}, false);
};

export const verifyInvitation = (token: string): Promise<OrganizationInvite> => {
  // This can be a public or auth api call depending on if the user is logged in
  return api<OrganizationInvite>(`/auth/invites/verify/?token=${token}`, {}, false);
};

export const acceptInvitation = (token: string): Promise<{ detail: string }> => {
  return authApi<{ detail: string }>(`/auth/invites/accept/`, {
    method: "POST",
    body: JSON.stringify({ token }),
  }, false);
};

export const declineInvitation = (invitationId: string): Promise<{ detail: string }> => {
  return authApi<{ detail: string }>(`/auth/invites/${invitationId}/decline/`, {
    method: "POST"
  }, false);
};

export const cancelInvitation = (invitationId: string): Promise<{ detail: string }> => {
  return authApi<{ detail: string }>(`/auth/invites/${invitationId}/cancel/`, {
    method: "POST"
  }, false);
};

export const requestOtp = (data: TRequestOtpSchema): Promise<{detail: string}> => {
  return api<{detail: string}>(`/auth/request-otp/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }, false);
};

export const verifyOtp = (data: TOtpVerifySchema): Promise<{detail: string}> => {
  return api<{detail: string}>(`/auth/otp-verify/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }, false);
};

export const getMe = (): Promise<User> => {
  return authApi<User>(`/auth/me/`, {}, false);
};

export const updateProfile = (data: TUpdateProfileSchema): Promise<User> => {
  return authApi<User>(`/auth/me/update/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }, false);
};

export const changePassword = (data: TChangePasswordSchema): Promise<{detail: string}> => {
    // Omit confirm_password before sending
    const { confirm_password, ...payload } = data;
  return authApi<{detail: string}>(`/auth/change-password/`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, false);
};

export const createOrganization = (
  data: TCreateOrganizationSchema
): Promise<Organization> => {
  return authApi<Organization>(`/auth/organizations/`, {
    method: "POST",
    body: JSON.stringify(data),
  }, false);
};

// Wallet Related Endpoints (Assuming these still use API versioning)
export const getWalletBalance = (organizationId: string): Promise<{ balance: string }> => {
  return authApi<{ available_balance: string }>(`/wallet/balance/${organizationId}/`);
};

export const createWallet = (organization_id: string): Promise<any> => {
  return authApi<any>(`/wallet/create/`, {
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
    `/wallet/initiate-payment/${organizationId}?payment_option=${paymentOption}&amount=${amount}`
  );
};

export const getTransactions = (organizationId: string): Promise<Transaction[]> => {
  return authApi<Transaction[]>(`/wallet/transactions/${organizationId}/`);
};

// Meter Related Endpoints
export const getMeters = (orgId: string): Promise<Meter[]> => {
  return authApi<Meter[]>(`/organizations/${orgId}/meters/`);
};

export const createMeter = (
  orgId: string,
  data: TCreateMeterSchema
): Promise<Meter> => {
  return authApi<Meter>(`/organizations/${orgId}/meters/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getMeter = (orgId: string, meterId: string): Promise<Meter> => {
  return authApi<Meter>(`/organizations/${orgId}/meters/${meterId}/`);
};

export const updateMeter = (
  orgId: string,
  meterId: string,
  data: Partial<TCreateMeterSchema>
): Promise<Meter> => {
  return authApi<Meter>(`/organizations/${orgId}/meters/${meterId}/`, {
    method: "PATCH", // Using PATCH for partial updates
    body: JSON.stringify(data),
  });
};

export const deleteMeter = (orgId: string, meterId: string): Promise<void> => {
  return authApi<void>(`/organizations/${orgId}/meters/${meterId}/`, {
    method: "DELETE",
  });
};

// API Key Endpoints
export const getApiKeys = (orgId: string): Promise<ApiKey[]> => {
  return authApi<ApiKey[]>(
    `/auth/organizations/${orgId}/api-keys/`, {}, false
  );
};

export const createApiKey = (
  orgId: string,
  data: TCreateApiKeySchema
): Promise<CreateApiKeyResponse> => {
  return authApi<CreateApiKeyResponse>(
    `/auth/organizations/${orgId}/api-keys/create/`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    false
  );
};

export const regenerateApiKey = (
  orgId: string,
  apiKeyId: string
): Promise<CreateApiKeyResponse> => {
  return authApi<CreateApiKeyResponse>(
    `/auth/organizations/${orgId}/api-keys/${apiKeyId}/regenerate/`,
    {
      method: "POST",
    },
    false
  );
};

export const updateApiKey = (
  orgId: string,
  apiKeyId: string,
  data: { is_active: boolean }
): Promise<ApiKey> => {
  return authApi<ApiKey>(
    `/auth/organizations/${orgId}/api-keys/${apiKeyId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    false
  );
};

export const deleteApiKey = (
  orgId: string,
  apiKeyId: string
): Promise<void> => {
  return authApi<void>(
    `/auth/organizations/${orgId}/api-keys/${apiKeyId}/`,
    {
      method: "DELETE",
    },
    false
  );
};

export const generateToken = (
  orgId: string,
  data: GenerateTokenRequest
): Promise<TokenResponse> => {
  return authApi<TokenResponse>(`/organizations/${orgId}/generate-token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(), // Ensure idempotency
    },
    body: JSON.stringify(data),
  });
};
