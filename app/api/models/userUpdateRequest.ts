export type UserUpdateRequest = {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  dotNumber: string;
  role: string;
  status: string;
  modifiedBy: string;
  modified: string;
  created: string;
  createdBy: object;
}