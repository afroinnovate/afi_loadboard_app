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
        const response = await fetch(baseUrl + "bids/", {
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
        type bidResponses = BidResponse[];
        const responseData: bidResponses = { ...data};
        return responseData;
    } catch (error) {
        throw error // Rethrow the error to be handled by the caller
    }
}

export async function GetBid(token: string, id: Number) {
    try {
        const response = await fetch(`${baseUrl}bids/${id}`, {
            method: 'GET',
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
        //  return resp.text
        const responseData: any  = { ...resp};
        return responseData;
        
    } catch (error) {
        console.log("bid service get by ID op",error)
        return error // Rethrow the error to be handled by the caller
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
        console.log("bid service delete op",error)
        return error // Rethrow the error to be handled by the caller
    }
}

export async function UpdateBid(token: string, id: Number, bidRequest: BidRequest) {
    try {
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