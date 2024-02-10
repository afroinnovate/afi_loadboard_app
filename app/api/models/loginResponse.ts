import type { LoginUser } from "./loginResponseUser";

export type LoginResponse =  {
    tokenType: string;
    expiresIn: number;
    refreshToken: string;
    token: string;
    user: LoginUser;
}