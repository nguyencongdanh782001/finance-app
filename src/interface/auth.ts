export type AuthPurpose = "LOGIN" | "REGISTER";
export type AuthProvider = "WEB" | "GOOGLE";

export interface RequestOtpResponse {
  success: boolean;
  email: {
    sent: boolean;
    skipped: boolean;
    error?: string;
  };
  devOtp?: string;
}

export interface AuthUser {
  id: number;
  phone: string | null;
  email: string | null;
  role: string;
  displayName: string | null;
  authProvider: AuthProvider;
}

export interface VerifyOtpResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResponse extends RequestOtpResponse {
  accessToken?: string;
  user?: AuthUser;
  alreadyVerified?: boolean;
}

export interface LoginResponse extends Partial<VerifyOtpResponse> {
  requiresEmailVerification?: boolean;
  message?: string;
  email?: RequestOtpResponse["email"];
  devOtp?: string;
}

export type GoogleLoginResponse = VerifyOtpResponse;
