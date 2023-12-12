// import { invariant } from "@remix-run/router/dist/history";
import type { User } from "../models/user";



export async function Login(email: string, password: string) {
    // Validate username and password
    invariant(email, 'Username is required');
    invariant(password, 'Password is required');
    // Make API call
    const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email, password
        })
    });

    return response.json();
}

export async function GetUsers() {
    // Make API call
    const response = await fetch('http://localhost:3001/Users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response.json();
}

export async function Register(user: User) {
    // const { firstName, lastName, dob, email, password, verifyPassword, phone } = user;
    // invariant(firstName, 'First Name is required');
    // invariant(lastName, 'Last Name is required');
    // invariant(dob, 'Date of Birth is required');
    // invariant(email, 'Email is required');
    // invariant(phone, 'Phone is required');
    // password === verifyPassword ? invariant(password, 'Password is required') : invariant(password === verifyPassword, 'Passwords do not match');
    
    // Make API call
    const response = await fetch('http://localhost:3001/Users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });

    return response.json();
}

