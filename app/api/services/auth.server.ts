// import { invariant } from "@remix-run/router/dist/history";
import type { User } from "../models/user";
import invariant from 'tiny-invariant';
import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session";
import type { LoginResponse } from "../models/loginResponse";
import { FormStrategy } from "remix-auth-form";
import { CompleteProfileRequest } from "../models/profileCompletionRequest";

const baseUrl = 'https://api.auth.afroinnovate.com/auth';

export let authenticator = new Authenticator<LoginResponse >(sessionStorage, {
    sessionKey: "_auth_data",
    sessionErrorKey: "_auth_error",
});


// Tell the Authenticator to use the form strategy
authenticator.use(
    new FormStrategy(async ({ form, context }) => {

        let email = form.get("email") as string;
        let password = form.get("password") as string;

        invariant(email, "Missing email parameter");
        invariant(password, "Missing password parameter");

        try {
            let loginResponse = await Login(email, password);

            if (loginResponse instanceof Error) {
                throw loginResponse;
            }

            return loginResponse;
        } catch (error) {
            throw error;
        }
    }),
    "user-pass"
);

export async function Login(email: string, password: string) {
    try {
        const response = await fetch(baseUrl + "/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "username": email, "password": password })
        });
        // Check if the response is not ok (e.g., 400 or 500 status codes)
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        // Assuming the response returns a JSON object
        const data = await response.json();
        // console.log("data -->", data);

        const responseData: LoginResponse = { ...data};
        return responseData;
    } catch (error) {
        throw error // Rethrow the error to be handled by the caller
    }
}

export async function Register(user: User) {
    try {
        const response = await fetch(baseUrl+"/register", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

       // Check if the response is not ok (e.g., 400 or 500 status codes)
       if (!response.ok) {
            // console.log(response.status, response.statusText);
            throw new Error(`${response.status}: ${response.statusText}`);
        }
        
        return response;
    }catch(error){
        // console.error(`Error during registration: ${error}`);
        throw error; // Rethrow the error to be handled by the caller
    }
}

export async function CompleteProfile(profile: CompleteProfileRequest) {
    try {
        const response = await fetch(baseUrl+"/completeprofile", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profile)
        });

       // Check if the response is not ok (e.g., 400 or 500 status codes)
       if (!response.ok) {
            // console.log(response.status, response.statusText);
            throw new Error(`${response.status}: ${response.statusText}`);
        }
        
        return response;
    }catch(error){
        // console.error(`Error during registration: ${error}`);
        throw error; // Rethrow the error to be handled by the caller
    }
}