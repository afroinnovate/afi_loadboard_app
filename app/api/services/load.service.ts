import type { LoadRequest } from "../models/loadRequest";
import type { LoadResponse } from "../models/loadResponse";

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
            throw new Error (`${response.status}: ${response.statusText}`);
        }

        // Assuming the response returns a JSON object
        const data = await response.json();
        
        const responseData: LoadResponse = { ...data};
      
        return responseData;
    } catch (error) {
        return error // Rethrow the error to be handled by the caller
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

        // Get the user data from the response
        return responseData;
    } catch (error) {
        throw error // Rethrow the error to be handled by the caller
    }
}

export async function DeleteLoad(token: string, id: Number) {
    try {
        const response = await fetch(`${baseUrl}loads/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
     
        // Check if the response is not ok (e.g., 400 or 500 status codes)
        if ( response.status === 500 || response.status === 400) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        // Assuming the response returns a JSON object
         const resp = await response;
         return resp.text
        // const responseData: any  = { ...data};
        
    } catch (error) {
        console.log(error)
        throw error // Rethrow the error to be handled by the caller
    }
}

export async function UpdateLoad(token: string, id: Number, loadRequest: LoadRequest) {
    try {
        const url = `${baseUrl}loads/${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(loadRequest),

        });
        // Check if the response is not ok (e.g., 400 or 500 status codes)
        if (response.status !== 204) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        // Assuming the response returns a JSON object
        const data = await response;
      
        return data.text();
    } catch (error) {
        console.log("put error:", error)
        throw error // Rethrow the error to be handled by the caller
    }
}