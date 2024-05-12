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
  useRouteError,
} from "@remix-run/react";
import { useEffect } from 'react';
import { checkUserRole } from '~/components/checkroles';
import ErrorDisplay from '~/components/ErrorDisplay';
import AccessDenied from '~/components/accessdenied';


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
//   token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YzEzNGVmMC1lZmY4LTQ2NmUtOTU1ZS1lMTk1NzAwZDg2OTYiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IldhciIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiN2MxMzRlZjAtZWZmOC00NjZlLTk1NWUtZTE5NTcwMGQ4Njk2IiwianRpIjoiMDRhYWZhZGEtM2NlOS00YWUxLThiOTctZWIyYzhkMDE1YTUyIiwibmJmIjoxNzE1NTQzMTc3LCJleHAiOjE3MTU1NDY3ODIsImlhdCI6MTcxNTU0MzE4MiwiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.s0SWf6H1Duv1861mGWz-vcrgXh9sVekiQjXzzGYS6oc",
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
//         "shipper"
//     ],
//     "companyName": "GatLuak LLCs",
//     "dotNumber": "SH12345"
//   }
// };

// Server-side data fetching
export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Find the parent route match containing the user and token
    const session = await getSession(request.headers.get("Cookie"));
    const user: any = session.get("user");

    // const user: any = userData;

    if (!user) {
      throw JSON.stringify({
        data: {
          message: "User not found",
          status: 401
        }
      })
    }

    const bidsResponse = await GetBids(user.token);
    // // Convert the bids object to an array if it's not already
    const bidsArray = Array.isArray(bidsResponse) ? bidsResponse : Object.values(bidsResponse);
    
    if (bidsArray.length <= 0) {
      throw new Response("No bids available", { status: 404 });
    }

    return json({ bidsArray, user });
  } catch (error: any) {
    if(JSON.parse(error).data.status === 401) {
      return redirect("/login/");  // Client-side redirect
    }
    throw error;
  }
};

export default function BidLoads() {
  const { bids, user } = useLoaderData();
  const actionData = useActionData();

  const [shipperAccess, shipperHasAccess, adminAccess, carrierAccess, carrierHasAccess] = checkUserRole(user.user?.roles);

  if (!shipperHasAccess) {
    return (
      <AccessDenied
        returnUrl="/dashboard/loads/view"
        message="You do not have enough access to see your biddings, Click Home to complete your profile"
      />
    );
  } else {
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
            <BidCard bid={ bid } shipperHasAccess={ shipperHasAccess } />
          </Form>
        ))}
      </div>
    </div>
  );
  }
}

export function ErrorBoundary() {
  let error: any = useRouteError();
  console.log("Error: ", error);
  const jsonError = JSON.parse(error);
  error = {
    message: jsonError.data.message,
    status: jsonError.data.status
  };

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
