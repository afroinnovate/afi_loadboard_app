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
      // console.log("throwing error")
      throw new Error(response);
    }

    const loads: LoadResponse = response

    return loads;
  }catch (error) {
    // console.error("view loader error ", error);
    return error;
  }
};


export default function ViewLoads() {
  const loaderData: any = useLoaderData();

  var error = ""
  if (loaderData && loaderData.errno){
   if (loaderData.errno === "ENOTFOUND"){
        error = "Oopse!, you seem to have connectivity issue, please connect to a reliable internet."
   }else {
        error = "Oops!, Something Went wrong, please try again."
    }
  }

  return (
    <div className="flex-auto container content-center justify-center items-center min-m-screen">
      <h1 className="flex text-2xl font-bold mb-4 text-green-500 justify-center ">Load View</h1>
      <table className='table pt-6 '>
        {/* Table headers */}
        <thead className='table-header-group'>
          <tr className='table-row p-10'>
            {/* Define your table headers here */}
          </tr>
        </thead>
       
        <tbody className='flex justify-center'>
       
        </tbody>
      </table>
      { error !== "" &&  <p className='flex justify-center text-red-500 text-sm itallic p-10'>{error}</p>}
    </div>
  );
}
