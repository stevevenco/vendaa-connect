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
} from "@/types";

const LOCAL_API_URL: string = "http://localhost:8000";
const STAGING_API_URL: string = "https://vendaa-be.onrender.com";
const PRODUCTION_API_URL: string = "https://api.example.com";
const API_VERSION: string = "api/v1";

const env: string = import.meta.env.VITE_ENV || "development";
let API_URL: string = "";
if (env === "development") {
  API_URL = LOCAL_API_URL;
} else if (env === "staging") {
  API_URL = STAGING_API_URL;
} else {
  API_URL = PRODUCTION_API_URL;
}

const getAuthToken: () => string | null = () => localStorage.getItem("access");

const api = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_URL}${url}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail ||
        (errorData.non_field_errors && errorData.non_field_errors[0]) ||
        "API request failed"
    );
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
  orgId: string,
  data: TAddMemberSchema
): Promise<void> => {
  return authApi<void>(`/${API_VERSION}/auth/organizations/${orgId}/members/`, {
    method: "POST",
    body: JSON.stringify(data),
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
