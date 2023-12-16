// import { invariant } from "@remix-run/router/dist/history";
import type { User } from "../models/user";
import invariant from 'tiny-invariant';
import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session";
import type { LoginResponse } from "../models/loginResponse";
import { FormStrategy } from "remix-auth-form";


// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<LoginResponse| Error | null>(sessionStorage, {
    sessionKey: "_auth_data",
    sessionErrorKey: "_auth_error",
});


const baseUrl = 'http://api.auth.afroinnovate.com:8080';
// Tell the Authenticator to use the form strategy
authenticator.use(
    new FormStrategy(async ({ form }) => {
        let email = form.get("email") as string;
        let password = form.get("password") as string;
        const phoneNumber = form.get("phoneNumber") as string;

        console.log("came to form strategy", email, password);

        //upfront validation
        invariant(email, "Missing email/phoneNumber parameter, one of them must be used to login");
        invariant(password, "Missing password parameter");
        
        // Make API call
        let loginResponse = await Login(email, password);
        
        console.log("login response ", loginResponse);
        
        return loginResponse;
    }),
    // The name of the form in the login route
    "user-pass"
);

export async function Login(email: string, password: string) {
    console.log("came to login function", email, password);

    try {
        const response = await fetch(baseUrl + "/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Check if the response is not ok (e.g., 400 or 500 status codes)
        if (!response.ok) {
            console.log(response.status, response.statusText);
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        // Assuming the response returns a JSON object
        const data = await response.json();
        console.log("data -->", data);

        const responseData: LoginResponse = { ...data};
        return responseData;
    } catch (error) {
        console.error(`Error during login: ${error}`);
        throw error; // Rethrow the error to be handled by the caller
    }
}

export async function Register(user: User) {
    invariant(user, 'User is required');
    invariant(user.email, 'Email is required');
    invariant(user.password, 'Last Name is required');
    // const { firstName, lastName, dob, email, password, verifyPassword, phone } = user;
    // invariant(firstName, 'First Name is required');
    // invariant(lastName, 'Last Name is required');
    // invariant(dob, 'Date of Birth is required');
    // invariant(email, 'Email is required');
    // invariant(phone, 'Phone is required');
    // password === verifyPassword ? invariant(password, 'Password is required') : invariant(password === verifyPassword, 'Passwords do not match');
    
    // Make API call
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
            console.log(response.status, response.statusText);
            throw new Error(`${response.status}: ${response.statusText}`);
        }
        
        return response;
    }catch(error){
        console.error(`Error during registration: ${error}`);
        throw error; // Rethrow the error to be handled by the caller
    }
}