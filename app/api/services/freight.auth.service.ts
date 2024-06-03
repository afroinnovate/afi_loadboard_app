import { type LoadRequest } from "../models/loadRequest";
import { User } from "../models/user";

const baseUrl = "https://api.frieght.afroinnovate.com/";

export async function UpdatePersonalInfo(loadRequest: LoadRequest, token: string) {
  try {
    const response = await fetch(baseUrl + "carriers/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(loadRequest),
    });

    // Check if the response is not ok (e.g., 400 or 500 status codes)
    if (response.status !== 201) {
      throw response;
    }

    // Assuming the response returns a JSON object
    const data = await response.json();

    const responseData: User = { ...data }
    return responseData;
  } catch (error: any) {
    switch (error.status) {
      case 404:
        throw JSON.stringify({
          data: {
            message: "Bid with ID 0 not found",
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