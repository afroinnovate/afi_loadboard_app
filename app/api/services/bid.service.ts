import type { BidRequest, BidUpdateRequest } from "../models/bidRequest";
import type { BidResponse } from "../models/bidResponse";

const baseUrl = "https://api.frieght.afroinnovate.com/";
// const baseUrl = "http://localhost:7070/";

export async function PlaceBid(bidRequest: BidRequest, token: string) {
  try {
    const response = await fetch(baseUrl + "bids/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bidRequest),
    });

    // Check if the response is not ok (e.g., 400 or 500 status codes)
    if (response.status !== 201) {
      throw response;
    }

    // Assuming the response returns a JSON object
    const data = await response.json();
    const responseData: BidResponse = { ...data };

    return responseData;
  } catch (error: any) {
    switch (error.status) {
      case 404:
        return JSON.stringify({
          data: {
            message: "Bid with ID 0 not found",
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

export async function GetBids(token: string) {
  try {
    const response = await fetch(`${baseUrl}bids/`, {
      // Use template literals for clean concatenation
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Better error handling: Check if the response is not OK (e.g., 400 or 500 status codes)
    if (!response.ok) {
      // Throwing an Error with a message that includes the status for clarity
      throw response;
    }

    // Directly return the parsed JSON data if successful
    return (await response.json()) as BidResponse[];
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

export async function GetBid(token: string, id: Number) {
  try {
    const response = await fetch(`${baseUrl}bids/load/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      // If the response is not OK, throw a new error with the status
      throw new Response(`Error fetching bid with ID ${id}`, {
        status: response.status,
      });
    }

    const responseData = await response.json();
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

export async function GetBidByLoadId(loadId: Number, token: string) {
  try {
    const response = await fetch(`${baseUrl}bids/load/${loadId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      console.log("No bids found for load", loadId);
      return null;
    }

    if (!response.ok) {
      throw new Response(`Error fetching bid with ID ${loadId}`, {
        status: response.status,
      });
    }

    const responseData = await response.json();
    return responseData;
  } catch (error: any) {
    switch (error.status) {
      case 404:
        throw JSON.stringify({
          data: {
            message: `Bid with ID ${loadId} not found`,
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


export async function GetBidByLoadIdandCarrierId(loadId: Number, carrierId: string, token: string) {
  try {
      const response = await fetch(`${baseUrl}bids/${loadId}/${carrierId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 404) {
        return null;
      }
  
      if (!response.ok) {
        // If the response is not OK, throw a new error with the status
        throw new Response(`Error fetching bid with ID ${loadId}`, {
          status: response.status,
        });
      }
  
      const responseData = await response.json();
      return responseData;
  } catch (error: any) {
    console.log('get bid error', error)
      switch (error.status) {
        case 404:
          return JSON.stringify({
            data: {
              message: `Bid with ID ${loadId} and ${carrierId} not found`,
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


export async function DeleteBid(token: string, id: Number) {
  try {
    const response = await fetch(`${baseUrl}bids/${id}`, {
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

export async function UpdateBid(
  token: string,
  id: Number,
  bidRequest: BidUpdateRequest
) {
  try {
    const url = `${baseUrl}bids/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bidRequest),
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
            message: "Bid with ID 0 not found",
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

export async function GetBidsByCarrierId(token: string, carrierId: number) {
  try {
    const response = await fetch(`${baseUrl}bids/carrier/${carrierId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Response(`Error fetching bid with ID ${carrierId}`, {
        status: response.status,
      });
    }

    const responseData = await response.json();
    return responseData;
  } catch(error: any) {
    switch (error.status) {
      case 404:
        throw JSON.stringify({
          data: {
            message: "Bid with ID 0 not found",
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
