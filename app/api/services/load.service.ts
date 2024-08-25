import type { LoadRequest } from "../models/loadRequest";
import type { Load, LoadResponse } from "../models/loadResponse";

const baseUrl = "https://api.frieght.afroinnovate.com/";
// const baseUrl = "http://localhost:7070/";

export async function AddLoads(loadRequest: LoadRequest, token: string) {
  try {
    const response = await fetch(baseUrl + "loads/", {
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

    const responseData: Load = { ...data }
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

export async function GetLoads(token: string) {
  try {
    const response = await fetch(baseUrl + "loads/", {
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
    const responseData: LoadResponse = [...data];

    // Get the user data from the response
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

export async function DeleteLoad(token: string, id: Number) {
  try {
    const response = await fetch(`${baseUrl}loads/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if the response is not ok (e.g., 400 or 500 status codes)
    if (response.status === 500 || response.status === 400) {
      throw response;
    }

    // Assuming the response returns a JSON object
    const resp = await response;
    return resp.text;
    // const responseData: any  = { ...data};
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

export async function UpdateLoad(
  token: string,
  id: Number,
  loadRequest: LoadRequest
) {
  try {
    const url = `${baseUrl}loads/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(loadRequest),
    });
    // Check if the response is not ok (e.g., 400 or 500 status codes)
    if (response.status !== 204) {
      throw response;
    }

    // Assuming the response returns a JSON object
    const data = await response;

    return data.text();
  } catch (error: any) {
    switch (error.status) {
      case 404:
        throw JSON.stringify({
          data: {
            message: "Load with ID 0 not found",
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
