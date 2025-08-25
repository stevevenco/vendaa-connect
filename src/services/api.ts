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
} from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthToken = () => localStorage.getItem("access");

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
  return api<AuthResponse>("/api/v1/auth/login/", {
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
  return api<RegisterResponse>("/api/v1/auth/register/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const requestOtp = (data: TRequestOtpSchema): Promise<void> => {
  return api<void>("/api/auth/request-otp/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const verifyOtp = (data: TOtpVerifySchema): Promise<void> => {
  return api<void>("/api/auth/otp-verify/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const getMe = (): Promise<User> => {
  return authApi<User>("/api/v1/auth/me/");
};

export const updateProfile = (data: TUpdateProfileSchema): Promise<User> => {
  return authApi<User>("/api/v1/auth/me/update/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const changePassword = (data: TChangePasswordSchema): Promise<void> => {
  return authApi<void>("/api/v1/auth/change-password/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const createOrganization = (
  data: TCreateOrganizationSchema
): Promise<Organization> => {
  return authApi<Organization>("/api/v1/auth/organizations/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
