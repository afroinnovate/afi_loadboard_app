export type CompleteProfileRequest = {
    username: string;
    firstName: string;
    lastName: string;
    companyName?: string | null;
    dotNumber?: string | null;
    role: string;
}
  