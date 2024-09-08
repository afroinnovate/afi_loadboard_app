import invariant from "tiny-invariant";
import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session";
import type { LoginResponse } from "../models/loginResponse";
import { FormStrategy } from "remix-auth-form";
import type { PasswordResetRequest } from "../models/passwordResetRequest";
import { type PasswordUpdateRequest } from "../models/paswordUpdateRequest";

const baseUrl = 'https://api.auth.afroinnovate.com/auth';
// const baseUrl = "http://localhost:8080/auth";

export let authenticator = new Authenticator<LoginResponse>(sessionStorage, {
  sessionKey: "_auth_data",
  sessionErrorKey: "_auth_error",
});

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let username = form.get("email") as string;
    let password = form.get("password") as string;

    invariant(username, "Missing email parameter");
    invariant(password, "Missing password parameter");

    try {
      let loginResponse = await Login(username, password);

      if (loginResponse instanceof Error) {
        throw loginResponse;
      }

      return loginResponse;
    } catch (error) {
      console.error("Error during authentication", error);
      throw error;
    }
  }),
  "user-pass"
);

export async function Login(email: string, password: string) {
  try {
    const response = await fetch(baseUrl + "/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: email, password: password }),
    });
    // Check if the response is not ok (e.g., 400 or 500 status codes)
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    // Assuming the response returns a JSON object
    const data = await response.json();

    const responseData: any = { ...data };

    return responseData;
  } catch (error) {
    throw error; // Rethrow the error to be handled by the caller
  }
}

export async function Register(user: any) {
  try {
    const response = await fetch(baseUrl + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    // Check if the response is not ok (e.g., 400 or 500 status codes)
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    throw error; // Rethrow the error to be handled by the caller
  }
}

export async function CompleteProfile(profile: any) {
  try {
    const response = await fetch(baseUrl + "/completeprofile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    // Check if the response is not ok (e.g., 400 or 500 status codes)
    if (response.status !== 200) {
      throw response;
    }

    return response;
  } catch (error: any) {
    switch (error.status) {
      case 404:
        throw JSON.stringify({
          data: {
            message: "User with the provided email does not exist, create your account or try again",
            status: 404,
          },
        });

      case 500:
        throw JSON.stringify({
          data: {
            message: "Internal server error",
            status: 500,
          },
        });

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

export async function RequestResetPassword(email: string) {
  try {
    const response = await fetch(
      `${baseUrl}/request-password-reset?email=${email}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the response is not ok (e.g., 400 or 500 status codes)
    if (response.status !== 200) {
      throw response;
    }

    return response;
  } catch (error: any) {
    switch (error.status) {
      case 404:
        throw JSON.stringify({
          data: {
            message: "User with the provided email does not exist, create your account or try again",
            status: 404,
          },
        });

      case 500:
        throw JSON.stringify({
          data: {
            message: "Internal server error",
            status: 500,
          },
        });

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

export async function ChangePassword(request: PasswordResetRequest) {
  try {
    const response = await fetch(baseUrl + "/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    // Check if the response is not ok (e.g., 400 or 500 status codes)
    if (response.status !== 200) {
      throw response
    }

    return response;
  } catch (error: any) {
    switch (error.status) {
        case 404:
          throw JSON.stringify({
            data: {
              message: "User with the provided email does not exist, create your account or try again",
              status: 404,
            },
          });
  
        case 500:
          throw JSON.stringify({
            data: {
              message: "Internal server error",
              status: 500,
            },
          });
  
        case 400:
          throw JSON.stringify({
            data: {
              message: "The token sent must've expired or invalid",
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

export async function UpdatePasswordInProfile(request: PasswordUpdateRequest) {
  try {
    if(request.email === "" || request.currentPassword === ""){
      throw JSON.stringify({
        data: {
          message: "Email and current password are required",
          status: 400,
        },
      });
    }

    const response = await fetch(baseUrl + "/update-password-inprofile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    // Check if the response is not ok (e.g., 400 or 500 status codes)
    if (response.status !== 200) {
      throw response
    }

    return response;
  } catch (error: any) {
    switch (error.status) {
        case 404:
          throw JSON.stringify({
            data: {
              message: "User with the provided email does not exist, create your account or try again",
              status: 404,
            },
          });
  
        case 500:
          throw JSON.stringify({
            data: {
              message: "Internal server error",
              status: 500,
            },
          });
  
        case 400:
          throw JSON.stringify({
            data: {
              message: "Something is wrong with the request",
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


