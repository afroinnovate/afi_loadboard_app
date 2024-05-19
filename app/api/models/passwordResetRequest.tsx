
export interface PasswordResetRequest {
  email: string;
  token: string;
  newPassword: string;
}