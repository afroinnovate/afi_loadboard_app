// routes/dashboard/bids.tsx
import { useActionData, Form, type MetaFunction, useLoaderData, useNavigate } from '@remix-run/react';
import { authenticator } from "../api/services/auth.server";
import { commitSession, getSession } from "../api/services/session";
import { BidRequest } from '~/api/models/bidRequest';
import customStyles from "../styles/global.css";
import type { BidResponse } from '~/api/models/bidResponse';
import { GetBids } from '~/api/services/bid.service';
import { LoaderFunction, json, redirect } from '@remix-run/node';
import { BidCard } from '~/components/BidCard';
import {
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import { useEffect } from 'react';


export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Shipper's Bidding dashboard",
      description: "Bidding Dashboard for Shippers",
    },
  ];
};
export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

// const userData: LoginResponse = {
//   token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0Y2MxMTZmMC04ZjA3LTQzMDUtODI0Zi00NTgwYTIzZjI3MDAiLCJnaXZlbl9uYW1lIjoiR2F0bHVhayIsImZhbWlseV9uYW1lIjoiRGVuZyIsImVtYWlsIjoidGFuZ29nYXRkZXQ3NkBnbWFpbC5jb20iLCJuYW1laWQiOiI0Y2MxMTZmMC04ZjA3LTQzMDUtODI0Zi00NTgwYTIzZjI3MDAiLCJqdGkiOiIzZDRiYTJjYi01YjZiLTRhOTktOTFjNi1jMjcxYTdlZDk2OWUiLCJuYmYiOjE3MTMxMzExNDIsImV4cCI6MTcxMzEzNDc0NywiaWF0IjoxNzEzMTMxMTQ3LCJpc3MiOiJhZnJvaW5ub3ZhdGUuY29tIiwiYXVkIjoiYXBwLmxvYWRib2FyZC5hZnJvaW5ub3ZhdGUuY29tIn0.uBEubFPiHLvWsb9qDahhrZi_0c6CdCkknKGprO4ejGI",
//   tokenType: "Bearer",
//   refreshToken: "eyJhbGci",
//   expiresIn: 3600,
//   user: {
//     "id": "4cc116f0-8f07-4305-824f-4580a23f2700",
//     "userName": "tangogatdet76@gmail.com",
//     "email": "tangogatdet76@gmail.com",
//     "firstName": "Gatluak",
//     "lastName": "Deng",
//     "roles": [
//         "independent_shipper"
//     ],
//     "companyName": "GatLuak LLCs",
//     "dotNumber": "SH12345"
//   }
// };

// Server-side data fetching
export const loader: LoaderFunction = async ({ request }) => {
  try {
   
    // // Find the parent route match containing the user and token
    const session = await getSession(request.headers.get("Cookie"));
    const user: any = session.get("user");

    // const user: any = userData;

    if (!user) {
      throw new Error("401 Unauthorized");
    }

    const bidsResponse = await GetBids(user.token);
    // // Convert the bids object to an array if it's not already
    const bidsArray = Array.isArray(bidsResponse) ? bidsResponse : Object.values(bidsResponse);
    
    if (bidsArray.length <= 0) {
      throw new Response("No bids available", { status: 404 });
    }

    // Define a hardcoded carrier object
    const hardcodedCarrier = {
      id: 100,
      companyName: "Carrier X",
      dotNumber: "DOT123456",
      email: "contact@carrierx.com",
      phoneNumber: "555-1234-567"
    };

   // Enrich each bid with the hardcoded carrier information
   const bids = bidsArray.map(bid => ({
      ...bid,
      carrier: hardcodedCarrier
    }));

    // Test each status failure
    // throw new Response("Internal Server Error", { status: 400 });

    return json({ bids, user });
  } catch (error: any) {
    console.error("Error in Dashboard: ", error);
    throw error;
  }
};

export default function BidLoads() {
  const { bids, user } = useLoaderData();
  const actionData = useActionData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center shadow-md border-spacing-3 mb-1">
        <h1 className="text-2xl font-san font-serif mb-2 p-3 text-center text-green-700 shadow-md shadow-gray-600">
          Review Bids
        </h1>
      </div>
      <div className="col-span-2">
        <div className="bg-gray-100 p-3 text-gray-600 text-sm">
          <div className="grid grid-cols-3">
            <span></span>
            <span>Bid Amount</span>
            <span>Bid By</span>
          </div>
        </div>
        {bids.map(bid => (
          <Form method="post" key={bid.id}>
            <BidCard bid={bid} />
          </Form>
        ))}
      </div>
    </div>
  );
}


export function ErrorBoundary() {
  const error: any = useRouteError();
  const navigate = useNavigate();
  console.log("Error in BidsRoute: ", error.status);

  useEffect(() => {
    if (error.status === 401) {
      console.log("redirecting to login");
      navigate("/login/");  // Client-side redirect
    }
  }, [error, navigate]);
  
  if (error.status === 404) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center shadow-md border-spacing-3 mb-3">
          <h1 className="text-2xl font-san font-serif mb-4 p-3 text-center text-green-700 shadow-md shadow-gray-600">
            Review Bids
          </h1>
        </div>
        <h1 className='flex justify-center items-center pt-6 text-blue-400 animate-pulse text-justify font-medium'>There are no bids added yet, Check again later</h1>
      </div>
    );
  } else if (error.status === 401) {
    console.log("redirecting to login")
    return null;
  }else{
    // Handle other kinds of errors or unknown errors
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center shadow-md border-spacing-3 mb-3">
          <h1 className="text-2xl font-san font-serif mb-4 p-3 text-center text-green-700 shadow-md shadow-gray-600">
            Review Bids
          </h1>
        </div>
        <h1 className='flex justify-center items-center pt-3 text-red-400'>Hmm, something went wrong!</h1>
      </div>
    );
  }
}