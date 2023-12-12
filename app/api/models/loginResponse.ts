
export type LoginResponse =  {
    tokenType: string;
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
}

export type Response = {
    type: string;
    status: number;
    title: string;
    detail: string;
}