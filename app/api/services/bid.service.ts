import type { BidRequest } from "../models/bidRequest";
import type { BidResponse } from "../models/bidResponse";

const baseUrl = "https://api.frieght.afroinnovate.com/";

export async function PlaceBid(bidRequest: BidRequest, token: string) {
    try {
        const response = await fetch(baseUrl + "bids/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bidRequest),

        });
        // Check if the response is not ok (e.g., 400 or 500 status codes)
        if (response.status !== 201) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        // Assuming the response returns a JSON object
        const data = await response.json();
        const responseData: BidResponse = { ...data};
      
        return responseData;
    } catch (error) {
        console.log("bid service error:", error)
        return error // Rethrow the error to be handled by the caller
    }
}

export async function GetBids(token: string) {
    try {
        const response = await fetch(`${baseUrl}bids/`, { // Use template literals for clean concatenation
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Better error handling: Check if the response is not OK (e.g., 400 or 500 status codes)
        if (!response.ok) {
            // Throwing an Error with a message that includes the status for clarity
            throw new Response(`Failed to fetch bids`, { status: response.status });
        }

        // Directly return the parsed JSON data if successful
        return await response.json() as BidResponse[];
    } catch (error) {
        console.error("Error fetching bids:", error);
        // Rethrow the error to be handled by the caller
        throw error;
    }
}

export async function GetBid(token: string, id: Number) {
    try {
        console.log("bid service get by ID op", id);
        const response = await fetch(`${baseUrl}bids/load/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // If the response is not OK, throw a new error with the status
            throw new Response(`Error fetching bid with ID ${id}`, { status: response.status });
        }

        const responseData = await response.json();
        console.log("bid service get by ID op Response Data", responseData);
        return responseData;

    } catch (error) {
        console.log("bid service get by ID op Error", error);
        throw error;  // Rethrow the error to be handled by the caller
    }
}

export async function DeleteBid(token: string, id: Number) {
    try {
        const response = await fetch(`${baseUrl}bids/${id}`, {
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
       throw new Response;// Rethrow the error to be handled by the caller
    }
}

export async function UpdateBid(token: string, id: Number, bidRequest: BidRequest) {
    try {
        console.log("bid serviceput op",bidRequest)
        const url = `${baseUrl}bids/${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bidRequest),

        });
        const res = await response;
        console.log("bid serviceput res:", res)
        // Check if the response is not ok (e.g., 400 or 500 status codes)
        if (response.status !== 204) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        // Assuming the response returns a JSON object
        const data = await response;
        
        return data.text();
    } catch (error) {
        console.log("bid serviceput error:", error)
        return String(error) // Rethrow the error to be handled by the caller
    }
}