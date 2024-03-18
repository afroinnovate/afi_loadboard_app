import type { ActionFunction, LinksFunction, LoaderFunction } from "@remix-run/node";
import { Form, type MetaFunction, useNavigation } from "@remix-run/react";
import customStyles from "../styles/global.css";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Loadboard | Shipper dashboard",
      description: "Update Load",
    },
  ];
};

export const links: LinksFunction = () => [
  ...(customStyles ? [{ rel: "stylesheet", href: customStyles }] : []),
];

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
  loadId
}: any) {

     // Use useMemo to optimize and cache the formatted date
  let formatedPickUpDate = new Date(pickupDate).toISOString().split("T")[0];
  let formatedDeliveryDate = new Date(deliveryDate).toISOString().split("T")[0];
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [loadInfo, setloadInfo] = useState({
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
    setloadInfo((prevData) => ({
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
                      <input type="hidden" name="loadId" value={loadId} />
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 relative">
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                            ${loadInfo.origin.length >= 2 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="origin"
                          type="text"
                          placeholder=" "
                          name="origin"
                          value={loadInfo.origin}
                          // defaultValue={loadInfo.origin}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="origin"
                          className={`absolute transition-all left-5 px-1 ${loadInfo.origin.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${loadInfo.origin.length > 0 ? 'text-md' : ''}`}
                        >
                          Origin
                        </label>
                      </div>
                      <div className="w-full md:w-1/2 px-3 relative">
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                            ${loadInfo.destination.length >= 2 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="destination"
                          type="text"
                          placeholder=" "
                          name="destination"
                          value={loadInfo.destination}
                          // defaultValue={loadInfo.destination}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="destination"
                          className={`absolute transition-all left-5 px-1 ${loadInfo.destination.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${loadInfo.destination.length > 0 ? 'text-md' : ''}`}
                        >
                          Destination
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-6">
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 relative">
                          <select
                            className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white `}
                            id="loadStatus"
                            name="loadStatus"
                            value={loadInfo.loadStatus}
                            onChange={(e) => setloadInfo({ ...loadInfo, loadStatus: e.target.value })}
                          >
                            <option value="" disabled>Select Status</option>
                            <option value="open">Open</option>
                            <option value="accepted">Accepted</option>
                            <option value="enroute">Enroute</option>
                            <option value="delivered">Delivered</option>
                            <option value="closed">Closed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <label
                            htmlFor="loadStatus"
                            className={`absolute transition-all left-5 px-1 ${loadInfo.loadStatus.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${loadInfo.loadStatus.length > 0 ? 'text-md' : ''}`}
                          >
                            Status
                          </label>

                      </div>
                      <div className="w-full md:w-1/2 px-3 relative">
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                            ${loadInfo.weight >= 0 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="weight"
                          step={1}
                          type="number"
                          placeholder=" "
                          name="weight"
                          value={loadInfo.weight}
                          // defaultValue={loadInfo.weight}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="weight"
                          className={`absolute transition-all left-5 px-1 ${loadInfo.weight === 0 || loadInfo.weight === undefined ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${loadInfo.weight > 0 || loadInfo.weight !== undefined ? 'text-md' : ''}`}
                        >
                          Weight
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-6">
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 relative">
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                            ${loadInfo.offerAmount > 0 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="offerAmount"
                          step={1}
                          type="number"
                          placeholder=" "
                          name="offerAmount"
                          value={loadInfo.offerAmount}
                          // defaultValue={loadInfo.offerAmount}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="offerAmount"
                          className={`absolute transition-all left-5 px-1 ${loadInfo.offerAmount === 0 || loadInfo.offerAmount === undefined ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${loadInfo.offerAmount > 0 || loadInfo.offerAmount !== undefined ? 'text-md' : ''}`}
                        >
                          Offer Amount
                        </label>
                      </div>
                      <div className="w-full md:w-1/2 px-3 relative">
                        <input
                            className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                             ${loadInfo.commodity.length >= 5 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                            type="text"
                            placeholder=" "
                            name="commodity"
                            value={loadInfo.commodity}
                            // defaultValue={loadInfo.commodity}
                            onChange={handleChange}
                            required
                          />
                          <label
                            htmlFor="commodity"
                            className={`absolute transition-all left-5 px-1 ${loadInfo.commodity.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${loadInfo.commodity.length > 0 ? 'text-md' : ''}`}
                          >
                            Items
                          </label>
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-6">
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 relative">
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                          ${ formatedPickUpDate <= new Date().toISOString().split("T")[0] ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="pickupDate"
                          name="pickupDate"
                          type="date"
                          placeholder="Pickup Date"
                          value={formatedPickUpDate}
                          // defaultValue={ formatedPickUpDate }
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="pickupDate"
                          className={`absolute transition-all left-5 px-1 ${formatedPickUpDate.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${formatedPickUpDate.length > 0 ? 'text-md' : ''}`}
                        >
                          Pickup Date
                        </label>
                      </div>
                      <div className="w-full md:w-1/2 px-3 relative">
                        <input type="hidden" name="loadId" value={loadId} />
                        <input
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
                          ${ formatedDeliveryDate >= Date.now().toString().split("T")[0] ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="deliveryDate"
                          type="date"
                          name="deliveryDate"
                          value={formatedDeliveryDate}
                          // defaultValue={ formatedDeliveryDate }
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="deliveryDate"
                          className={`absolute transition-all left-5 px-1 ${formatedDeliveryDate.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${formatedDeliveryDate.length > 0 ? 'text-md' : ''}`}
                        > 
                          Delivery Date
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-6">
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 relative">
                        <textarea
                          className={`appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-6 px-4 mb-3 leading-tight focus:outline-none focus:bg-white resize-none
                            ${loadInfo.loadDetails.length >= 5 ? 'border-t-white border-b-green-500' : 'border-b-red-500 border-l-red-500 border-r-red-500 border-t-white'}`}
                          id="loadDetails"
                          placeholder=""
                          name="loadDetails"
                          value={loadDetails}
                          // defaultValue={loadInfo.loadDetails}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="loadDetails"
                          className={`absolute transition-all left-5 px-1 ${loadInfo.loadDetails.length <= 0 ? 'top-2 text-gray-400' : '-top-3 text-gray-500'} ${loadInfo.loadDetails.length > 0 ? 'text-md' : ''}`}
                        >
                          Load Details  
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end items-right justify-right">
                        <input type="hidden" name="loadId" value={loadId} />
                        <input type="hidden" name="userId" value={userId} />
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
