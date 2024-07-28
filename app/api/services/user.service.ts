import type { User } from "../models/user";

const baseUrl = "http://localhost:7070";

export async function updateUserProfile(userId: string, userInfo: object, token: string) {

    console.log("request:", userId, userInfo)
    try {
        const response = await fetch(baseUrl + "/carriers/" + userId, {
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
        console.log("error", error)
        switch (error.status) {
            case 404:
                throw JSON.stringify({
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

