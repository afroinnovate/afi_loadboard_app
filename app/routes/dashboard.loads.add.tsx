import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { redirect, type ActionFunction, type LoaderFunction, json } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { authenticator } from '~/api/services/auth.server';
import AccessDenied from '~/components/accessdenied';
import type { LoginUser } from '~/api/models/loginResponseUser';
import { useState } from 'react';
import type { LoadRequest } from '~/api/models/loadRequest';
import { AddLoads } from '~/api/services/load.service';
import { getSession } from '~/api/services/session';
import type { LoadResponse } from '~/api/models/loadResponse';

// const userData: LoginResponse = {
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZTJmMzJhZC1jNzc4LTQ3OWEtYjcyMi04OGU0MjdjM2I2ZmQiLCJnaXZlbl9uYW1lIjoiVGFuZ28iLCJmYW1pbHlfbmFtZSI6IlRldyIsImVtYWlsIjoidGFuZ29nYXRkZXQ3NkBnbWFpbC5jb20iLCJuYW1laWQiOiJhZTJmMzJhZC1jNzc4LTQ3OWEtYjcyMi04OGU0MjdjM2I2ZmQiLCJqdGkiOiJhYjc4Zjc3OC1mMDEwLTQ0ZjAtYjM2NS1iNjc1OWJhMDBhYTIiLCJuYmYiOjE3MDg3NTM5NTIsImV4cCI6MTcwODc1NzU1NywiaWF0IjoxNzA4NzUzOTU3LCJpc3MiOiJhZnJvaW5ub3ZhdGUuY29tIiwiYXVkIjoiYXBwLmxvYWRib2FyZC5hZnJvaW5ub3ZhdGUuY29tIn0.WvOTqrLNwO9ogIWA-6KNxSRkSg041Wn_QrExGwDoaJI",
//   "tokenType": "Bearer",
//   "refreshToken": "eyJhbGci",
//   "expiresIn": 3600,
//   "user": {
//     "id": "ae2f32ad-c778-479a-b722-88e427c3b6fd",
//     "userName": "tangogatdet76@gmail.com",
//     "email": "tangogatdet76@gmail.com",
//     "firstName": "Tango",
//     "lastName": "Tew",
//     "roles": [
//         "support",
//         "carrier"
//     ]
//   }
// };

export const action: ActionFunction = async ({ request }) => {
  try{
    // Find the parent route match containing the user and token
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get("user");
    
         if (!user) {
      // Handle the missing token scenario
      throw new Response("401 Unauthorized", { status: 401 });
    }

    // const user = userData;

    const formData = await request.formData();

    // Validate the form data
    invariant(formData.has('origin'), 'Origin is required');
    invariant(formData.has('destination'), 'Destination is required');
    invariant(formData.has('pickupDate'), 'Pickup date is required');
    invariant(formData.has('deliveryDate'), 'Delivery date is required');
    invariant(formData.has('weight'), 'Weight is required');

    if (!user && !user.user.id) {
      invariant(formData.has('userId'), 'User ID is required');
    }

    if(isNaN(Number(formData.get('offerAmount'))) || formData.get('offerAmount') === ""){
      formData.set('offerAmount', '0');
    }

    const pickupDate = formData.get('pickupDate');
    const deliveryDate = formData.get('deliveryDate');

    // Assuming that the time part is not critical for the pickupDate and deliveryDate,
    // you can set it to a default time like 12:00:00.000Z (noon) or any other time you see fit.
    const formattedPickupDate = new Date(pickupDate + 'T12:00:00.000Z').toISOString();
    const formattedDeliveryDate = new Date(deliveryDate + 'T12:00:00.000Z').toISOString();

    // Create a new load request
    const loadRequest: LoadRequest = {
      loadDetails: formData.get('loadDetails') as string,
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      // pickupDate: "2024-02-10T14:20:14.916Z", // Format the date
      // deliveryDate:  "2024-02-14T14:20:14.916Z", // Format the date
      pickupDate: formattedPickupDate,
      deliveryDate: formattedDeliveryDate,
      commodity: formData.get('commodities') as string,
      weight: Number(formData.get('weight')), // Ensure number type
      offerAmount: Number(formData.get('offerAmount')), // Correct field and ensure number type
      userId: user.user.id,
      loadStatus: 'open'
    }
    
    const response: LoadResponse = await AddLoads(loadRequest, user.token);

    if (response && typeof response === 'string') {
      console.log("throwing error")
      throw new Error(response);
    }
    // Save the load to the database
    if(response){
      return redirect('/dashboard/loads/view');
    }else{
      return redirect('/dashboard/loads/add');
    }
  }catch(error){
    console.log("action error: ", error)
    return error;
  }
};

// check if the user is authenticated
export const loader: LoaderFunction = async ({ request }) => {  
  try {
    var user: any = await authenticator.isAuthenticated(request, {
      failureRedirect: '/login/'
    });
    // return the user info
    return user;
  }catch(error){
    return error
  }
  
}

export default function AddLoad() {
  const actionData: any = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const loaderData: any = useLoaderData();

  var roles: string[] = [""];
  var user: LoginUser = { id: '',userName: '', firstName: '', lastName: '', email: '', roles: [''] };

  user = loaderData.user;

  if (loaderData && loaderData.user) {
    user = loaderData.user;
    roles = user.roles.map((role: string) => role.toLowerCase());
  }
  // Check if user has 'support', 'admin' or any role containing 'carrier'
  const hasAccess = roles.includes('admin') || roles.some(role => role.includes('carrier'));

  const [offerType, setOfferType] = useState('flat');

  var error = ""
  if ((actionData && actionData.errno) || (loader && loader.errno)  ){
   if (actionData.errno === "ENOTFOUND"){
        error = "Oopse!, you seem to have connectivity issue, please connect to a reliable internet."
   }else {
        error = "Oops!, Something Went wrong, please try again."
    }
  }

  if (!hasAccess) { 
    return <AccessDenied returnUrl = "/dashboard/" message="You do not have enough access to add a load"/>
  }else{
    return (
      <div className="container mx-auto p-4 flex flex-col justify-center items-center min-m-screen overflow-hidden">
        <div className="flex justify-center items-center shadow-sm border-spacing-3 mb-6 w-full">
          <h1 className="text-2xl font-bold mb-4 p-6 text-center text-green-500">
            Add New Load Offer
          </h1>
        </div>
        { error !== "" &&  <p className='flex justify-start text-red-500 text-sm itallic p-5 m-5'>{error}</p>}
        <Form method="post" className="w-full max-w-4xl">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className='text-red-500'>*</span></label>
            <input type="text" name="title" id="title" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
          
          <div>
            <label htmlFor="loadDetails" className="block text-sm font-medium text-gray-700">Load Details</label>
            <input type="text" name="loadDetails" id="loadDetails" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>

          <div>
            <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Origin <span className='text-red-500'>*</span></label>
            <input type="text" name="origin" id="origin" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
          
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination <span className='text-red-500'>*</span></label>
            <input type="text" name="destination" id="destination" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>

          <div>
            <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">Pick-up Date <span className='text-red-500'>*</span></label>
            <input type="date" name="pickupDate" id="pickupDate" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
          
          <div>
            <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">Delivery Date <span className='text-red-500'>*</span></label>
            <input type="date" name="deliveryDate" id="deliveryDate" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
          
<div>
            <label htmlFor="commodities" className="block text-sm font-medium text-gray-700">Commodities <span className='text-red-500'>*</span></label>
            <input type="text" name="commodities" id="commodities" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                      </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                name="offerType" 
                id="offerType"
                value="flat" 
                className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" 
                checked={offerType === 'flat'} 
                onChange={() => setOfferType('flat')} />
              <span className="ml-2 text-gray-700">Flat Offer</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input 
                type="radio" 
                name="offerType" 
                value="negotiable" 
                className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" 
                checked={offerType === 'negotiable'} 
                onChange={() => setOfferType('negotiable')} />
              <span className="ml-2 text-gray-700">Negotiable</span>
            </label>
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight <span className='text-red-500'>*</span></label>
            <input type="number" name="weight" id="weight" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>

          {offerType === 'flat' && (
            <div>
            <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700">Offer Amount <span className='text-red-500'>*</span></label>
            <input type="number" name="offerAmount" id="offerAmount" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
          )}

        </div>
        <div className='flex justify-center mb-8'>
          <button type="submit" 
            className="items-center w-full py-2 px-4 mt-6  border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-orange-500 hover:italic hover:text-white text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
            {isSubmitting ? "Submitting the load..." : "Submit Load"}
          </button>
        </div>
        </Form>
        {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
      </div>

    );
  }
}
