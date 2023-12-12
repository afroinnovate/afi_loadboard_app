import invariant from "tiny-invariant";
import type { User } from "../models/user";
import { loginRequest } from "../models/loginRequest";
import { LoginResponse } from '../models/loginResponse';

const baseUrl = 'http://api.auth.afroinnovate.com:8080';

export async function SignIn(userRequest: loginRequest) {
    // Validate username and password
    invariant(userRequest, 'User Credentials are required');
    const {email, password } = userRequest;
    invariant(email, 'Username is required');
    invariant(password, 'Password is required');
    // Make API call
    await fetch(baseUrl+"/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email, password
        })
    }).then((response) => {
        response.json().then((data) => {
            console.log(data)
            if (data.ok) {
                // return data;
                const responseData: LoginResponse = {...data}
                
                return responseData;
            }
            
        });
    }).catch((error) => {
        console.log(`error: {error}`);
        if (error.status == 400 || error.status == 500) {
            throw new Error(`{error.statusText}`); 
        }
        // const response: Response = {...error};
       
    
    });
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
    const response = await fetch(baseUrl+"/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });
    if (response.status == 400 || response.status == 500) {
        throw new Error(`{response.statusText}`); 
    }
    
    return response;
}

