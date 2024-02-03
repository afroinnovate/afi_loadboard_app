// routes/dashboard/loads/view.tsx
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { LoadResponse } from '~/api/models/loadResponse';
import type { LoginResponse } from '~/api/models/loginResponse';
import { GetLoads } from '~/api/services/load.service';

const loaderData: LoginResponse = {
  "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjhlODJhYy1lZDFhLTQ3YTYtODAyNy05YTZmYzBhMGVmYjkiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IlRldyIsImVtYWlsIjoidGFuZ29nYXRkZXQ3NkBnbWFpbC5jb20iLCJuYW1laWQiOiIyMjhlODJhYy1lZDFhLTQ3YTYtODAyNy05YTZmYzBhMGVmYjkiLCJqdGkiOiIxOGMzOWEwYS05MWZiLTQ2NjMtYmI0Ni1jOTNkYTRhOGExNDYiLCJuYmYiOjE3MDY5MTgzMjUsImV4cCI6MTcwNjkyMTkzMCwiaWF0IjoxNzA2OTE4MzMwLCJpc3MiOiJhZnJvaW5ub3ZhdGUuY29tIiwiYXVkIjoiYXBwLmxvYWRib2FyZC5hZnJvaW5ub3ZhdGUuY29tIn0.389gdxqvSNeIqrqv-GnS1DNfXw43RBxH_E8syiKD7rw",
  "user": {
      "id": "228e82ac-ed1a-47a6-8027-9a6fc0a0efb9",
      "userName": "tangogatdet76@gmail.com",
      "email": "tangogatdet76@gmail.com",
      "firstName": "Tango",
      "lastName": "Tew",
      "roles": [
          "support_carrier",
          "owner_operator"
      ]
  },
  "expiresIn": 3600,
  "refreshToken": "eyJhbG",
  "tokenType": "Bearer"
}

export const loader: LoaderFunction = async () => {
  try {
    // Fetch the loads data from your API
    const response: LoadResponse = await GetLoads(loaderData.token);

    if (response && typeof response === 'string') {
      console.log("throwing error")
      throw new Error(response);
    }

    const loads: LoadResponse = response

    return loads;
  }catch (error) {
    console.error(error);
    return error;
  }
};


export default function ViewLoads() {
  const loads = useLoaderData();
  console.log("logging loads", loads);

  return (
    <div>
      <h1>View Loads</h1>
      <table>
        {/* Table headers */}
        <thead>
          <tr>
            {/* Define your table headers here */}
          </tr>
        </thead>
        <tbody>
          {loads.map((load) => (
            <tr key={load.id}>
              {/* Render your load data in table rows */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
