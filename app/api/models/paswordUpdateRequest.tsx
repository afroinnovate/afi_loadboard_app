export interface PasswordUpdateRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
}