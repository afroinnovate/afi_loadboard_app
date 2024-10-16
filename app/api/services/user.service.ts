import type { User, UserResponse } from "../models/user";

const baseUrl = "https://api.frieght.afroinnovate.com/";
// const baseUrl = "http://localhost:7070";

export async function updateUserProfile(userId: string, userInfo: object, token: string) {
    try {
        const response = await fetch(baseUrl + "users/" + userId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userInfo),
        });

        // Check if the response is not ok (e.g., 400 or 500 status codes)
        if (response.status !== 200) {
            throw response;
        }

        // Assuming the response returns a JSON object
        const data = await response.json();

        const responseData: User = { ...data }
        return responseData;
    } catch (error: any) {
        console.log("Update Profile error", error)
        switch (error.status) {
            case 404:
                return JSON.stringify({
                    data: {
                        message: "User with ID 0 not found",
                        status: 404,
                    },
                });

            case 500:
                throw new Error(
                    JSON.stringify({
                        data: {
                            message: "Internal server error",
                            status: 500,
                        },
                    })
                );
            case 400:
                throw JSON.stringify({
                    data: {
                        message: "Bad request",
                        status: 400,
                    },
                });
            case 401:
                throw JSON.stringify({
                    data: {
                        message: "Unauthorized",
                        status: 401,
                    },
                });
            default:
                throw JSON.stringify({
                    data: {
                        message: "An error occurred",
                        status: 500,
                    },
            });
        }
    }
}

// Get User info by id
export async function getUserInfo(userId: string, token: string) {
    try {
        const response = await fetch(baseUrl + "users/" + userId, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        // Check if the response is not ok (e.g., 400 or 500 status codes)
        if (response.status !== 200) {
            throw response;
        }

        // Assuming the response returns a JSON object
        const data = await response.json();
        const responseData: UserResponse = { ...data }
        return responseData;
    } catch (error: any) {
        switch (error.status) {
            case 404:
                return JSON.stringify({
                    data: {
                        message: "User with ID 0 not found",
                        status: 404,
                    },
                });

            case 500:
                throw JSON.stringify({
                    data: {
                        message: "Internal server error",
                        status: 500,
                    },
                })
            
            case 502:
                throw JSON.stringify({
                    data: {
                        message: "Server is down... Please try again later",
                        status: 502,
                    },
                })

                
            case 400:
                throw JSON.stringify({
                    data: {
                        message: "Bad request",
                        status: 400,
                    },
                });
            case 401:
                throw JSON.stringify({
                    data: {
                        message: "Unauthorized",
                        status: 401,
                    },
                });
            default:
                throw JSON.stringify({
                    data: {
                        message: "An error occurred",
                        status: 500,
                    },
            });
        }
    }
}

// Create a new user
export async function CreateUser(userInfo: object, token: string) {
    try {
        console.log("Creating a user")
        const response = await fetch(baseUrl + "users/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userInfo),
        });
        
        // console.log("User Creation response creating a user:", response);
        // Check if the response is not ok (e.g., 400 or 500 status codes)
        if (response.status !== 201) {
            throw response;
        }

        // Assuming the response returns a JSON object
        const data = await response.json();
        const responseData: any = { ...data }
        return responseData;
    } catch (error: any) {
        console.log("response error while creating a user:", error);
        let errorMessage = "An error occurred";
        let errorStatus = 500;

        if (error.status) {
            errorStatus = error.status;
            switch (error.status) {
                case 404:
                    errorMessage = error.message || "User with ID 0 not found";
                    break;
                case 400:
                    errorMessage = error.message || "Bad request";
                    break;
                case 401:
                    errorMessage = "Unauthorized";
                    break;
                case 502:
                    errorMessage = "Server is down... Please try again later";
                    break;
                case 500:
                    errorMessage = error.message || "Internal server error";
                    break;
            }
        }
        throw new Error(JSON.stringify({
            data: {
                message: errorMessage,
                status: errorStatus,
            },
        }));
    }
}
