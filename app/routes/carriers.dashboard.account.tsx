// app/routes/account.tsx
import { json } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";
import { useState } from "react";
import AccountOverlay from "~/components/accountOverlay";
import { getSession } from "~/session"; // Adjust path as necessary

const userData = {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YzEzNGVmMC1lZmY4LTQ2NmUtOTU1ZS1lMTk1NzAwZDg2OTYiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IldhciIsImVtYWlsIjoidGFuZ290ZXdAZ21haWwuY29tIiwibmFtZWlkIjoiN2MxMzRlZjAtZWZmOC00NjZlLTk1NWUtZTE5NTcwMGQ4Njk2IiwianRpIjoiYmJmNmZhOTEtOTljYy00NzAxLWJkZWUtNWRkMWY3MWJhZTdmIiwibmJmIjoxNzE1ODYwMTMwLCJleHAiOjE3MTU4NjM3MzUsImlhdCI6MTcxNTg2MDEzNSwiaXNzIjoiYWZyb2lubm92YXRlLmNvbSIsImF1ZCI6ImFwcC5sb2FkYm9hcmQuYWZyb2lubm92YXRlLmNvbSJ9.m24wLWyItr-658y3ewUgh1rex8hOjvbxM_MCDeodp9s",
  "tokenType": "Bearer",
  "refreshToken": "eyJhbGci",
  "expiresIn": 3600,
  "user": {
    "id": "7c134ef0-eff8-466e-955e-e195700d8696",
    "userName": "tangotew@gmail.com",
    "email": "tangotew@gmail.com",
    "firstName": "Tango",
    "lastName": "War",
    "roles": [
      "carrier"
    ],
    "phoneNumber": "+15806471212"
  }
};

export let loader = async ({ request }) => {
  try {
    const user: any = userData;
    if (!user) {
      throw JSON.stringify({
        data: {
          message: "Unauthorized",
          status: 401,
        },
      })
    }
    return json({ user });
  } catch (e: any) {
    if (JSON.parse(e).data.status === 401) {
      return "/";
    }
    throw e;
  }
};

export default function Account() {
  const loaderData: any = useLoaderData();
  const user = loaderData?.user;
  const [isOverlayOpen, setIsOverlayOpen] = useState(true);

  return (
    <div className="relative">
      {isOverlayOpen && (
        <AccountOverlay onClose={() => setIsOverlayOpen(false)} />
      )}
      <div className={`transition-opacity ${isOverlayOpen ? 'opacity-50' : 'opacity-100'}`}>
        <Outlet />
      </div>
    </div>
  );
}
