export type AuthPurpose = "REGISTER" | "VERIFY_PHONE";

export interface RequestOtpResponse {
  success: boolean;
  zalo: {
    sent: boolean;
    skipped: boolean;
    error?: string;
  };
  devOtp?: string;
}

export interface AuthUser {
  id: number;
  phone: string;
  role: string;
  displayName: string | null;
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
  requiresPhoneVerification?: boolean;
  message?: string;
  zalo?: RequestOtpResponse["zalo"];
  devOtp?: string;
}
