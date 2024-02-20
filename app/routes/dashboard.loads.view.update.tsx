import { ActionFunction, LinksFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Form, MetaFunction, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import customStyles from "../styles/global.css";
import { LoadRequest } from "~/api/models/loadRequest";
import { useState } from "react";
import invariant from "tiny-invariant";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Carrier dashboard",
      description: "Sign up for a new account",
    },
  ];
};

export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

export const loader: LoaderFunction = async ({ request, params }) => {
  const data = await request.text();
  console.log('params: ', params)
  console.log('request ', data);
  return json(request.body)
};

export const action: ActionFunction = async ({ request, params }) => {
  console.log('came to the action function')
  const data = await request.text();
  console.log('data ', data);
  console.log('params ', params)
  return redirect("../");
};

export default function UpdateLoadView({
  userId,
  origin,
  destination,
  pickupDate,
  deliveryDate,
  commodity,
  weight,
  offerAmount,
  loadDetails,
  loadStatus,
}: LoadRequest) {
  
  const actionData: any = useActionData();
  console.log("action data: ", actionData)

     // Use useMemo to optimize and cache the formatted date
  let formatedPickUpDate = new Date(pickupDate);
  let formatedDeliveryDate = new Date(deliveryDate);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [formData, setFormData] = useState({
    origin,
    destination,
    loadStatus,
    weight,
    offerAmount,
    commodity,
    loadDetails,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          <span className="absolute inset-0 bg-gray-500 opacity-75"></span>
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <div className="mt-2">
                  <Form method="post" className="w-full max-w-lg">
                    <div className="flex flex-wrap -mx-3 mb-6">
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 relative">
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                            ${formData.origin.length >= 2 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="origin"
                          type="text"
                          placeholder=" "
                          name="origin"
                          defaultValue={formData.origin}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="origin"
                          className={`absolute transition-all left-5 px-1 ${formData.origin.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${formData.origin.length > 0 ? 'text-md' : ''}`}
                        >
                          Origin
                        </label>
                      </div>
                      <div className="w-full md:w-1/2 px-3 relative">
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                            ${formData.destination.length >= 2 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="destination"
                          type="text"
                          placeholder=" "
                          name="destination"
                          defaultValue={formData.destination}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="destination"
                          className={`absolute transition-all left-5 px-1 ${formData.destination.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${formData.destination.length > 0 ? 'text-md' : ''}`}
                        >
                          Destination
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-6">
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 relative">
                        <input
                            className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white `}
                            id="status"
                            type="text"
                            placeholder=" "
                            name="status"
                            value={formData.loadStatus}
                            disabled
                            onChange={handleChange}
                          />
                          <label
                            htmlFor="status"
                            className={`absolute transition-all left-5 px-1 ${formData.loadStatus.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${formData.loadStatus.length > 0 ? 'text-md' : ''}`}
                          >
                            Status
                          </label>
                      </div>
                      <div className="w-full md:w-1/2 px-3 relative">
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                            ${formData.weight >= 0 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="weight"
                          step={1}
                          type="number"
                          placeholder=" "
                          name="weight"
                          defaultValue={formData.weight}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="weight"
                          className={`absolute transition-all left-5 px-1 ${formData.weight === 0 || formData.weight === undefined ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${formData.weight > 0 || formData.weight !== undefined ? 'text-md' : ''}`}
                        >
                          Weight
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-6">
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 relative">
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                            ${formData.offerAmount > 0 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="offerAmount"
                          step={1}
                          type="number"
                          placeholder=" "
                          name="offerAmount"
                          defaultValue={formData.offerAmount}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="offerAmount"
                          className={`absolute transition-all left-5 px-1 ${formData.offerAmount === 0 || formData.offerAmount === undefined ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${formData.offerAmount > 0 || formData.offerAmount !== undefined ? 'text-md' : ''}`}
                        >
                          Offer Amount
                        </label>
                      </div>
                      <div className="w-full md:w-1/2 px-3 relative">
                        <input
                            className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                             ${formData.commodity.length >= 5 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                            type="text"
                            placeholder=" "
                            name="commodity"
                            defaultValue={formData.commodity}
                            onChange={handleChange}
                            required
                          />
                          <label
                            htmlFor="commodity"
                            className={`absolute transition-all left-5 px-1 ${formData.commodity.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${formData.commodity.length > 0 ? 'text-md' : ''}`}
                          >
                            Items
                          </label>
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-6">
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 relative">
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                          ${formData.commodity.length >= 5 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="pickupDate"
                          type="date"
                          placeholder="Pickup Date"
                          defaultValue={ formatedPickUpDate.toISOString().split("T")[0] }
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="pickupDate"
                          className={`absolute transition-all left-5 px-1 ${formatedPickUpDate.toISOString().split("T")[0].length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${formatedPickUpDate.toISOString().split("T")[0].length > 0 ? 'text-md' : ''}`}
                        >
                          Pickup Date
                        </label>
                      </div>
                      <div className="w-full md:w-1/2 px-3 relative">
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                          ${formData.commodity.length >= 5 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="deliveryDate"
                          type="date"
                          name="deliveryDate"
                          defaultValue={ formatedDeliveryDate.toISOString().split("T")[0]? formatedDeliveryDate.toISOString().split("T")[0] : ""}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="deliveryDate"
                          className={`absolute transition-all left-5 px-1 ${formatedDeliveryDate.toISOString().split("T")[0].length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${formatedDeliveryDate.toISOString().split("T")[0].length > 0 ? 'text-md' : ''}`}
                        > 
                          Delivery Date
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-6">
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 relative">
                        <textarea
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-6 px-4 mb-3 leading-tight focus:outline-none focus:bg-white resize-none
                            ${formData.loadDetails.length >= 5 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="loadDetails"
                          placeholder=""
                          name="loadDetails"
                          defaultValue={formData.loadDetails}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="loadDetails"
                          className={`absolute transition-all left-5 px-1 ${formData.loadDetails.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${formData.loadDetails.length > 0 ? 'text-md' : ''}`}
                        >
                          Load Details  
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end items-right justify-right">
                      <button
                        className="bg-blue-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        name="_action"
                        value="save_changes"
                      >
                       {isSubmitting ? "Submitting the load..." : "Save Changes"}
                      </button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
