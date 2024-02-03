import type { LoadRequest } from "../models/loadRequest";
import { LoadResponse } from "../models/loadResponse";

const baseUrl = "https://api.frieght.afroinnovate.com/";

export async function AddLoads(loadRequest: LoadRequest, token: string) {
    try {
        const response = await fetch(baseUrl + "loads/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(loadRequest),

        });
        // Check if the response is not ok (e.g., 400 or 500 status codes)
        if (response.status !== 201) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        // Assuming the response returns a JSON object
        const data = await response.json();
        
        const responseData: LoadResponse = { ...data};
      
        return responseData;
    } catch (error) {
        throw error // Rethrow the error to be handled by the caller
    }
}

export async function GetLoads(token: string) {
    try {
        const response = await fetch(baseUrl + "loads/", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        // Check if the response is not ok (e.g., 400 or 500 status codes)
        if (response.status !== 200) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        // Assuming the response returns a JSON object
        const data = await response.json();
        const responseData: LoadResponse = { ...data};
        return responseData;
    } catch (error) {
        throw error // Rethrow the error to be handled by the caller
    }
}