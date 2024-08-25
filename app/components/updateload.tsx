import React, { useState, useEffect } from "react";
import { Form, useNavigation } from "@remix-run/react";
import { FloatingLabelInput } from "~/components/FloatingInput";
import { DateInput } from "~/components/dateInput";
import { Loader } from "~/components/loader";

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
  loadId,
  onClose,
  isSuccess,
}: any) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [loadInfo, setLoadInfo] = useState({
    origin,
    destination,
    loadStatus,
    weight,
    offerAmount,
    commodity,
    loadDetails,
    pickupDate: new Date(pickupDate).toISOString().split("T")[0],
    deliveryDate: new Date(deliveryDate).toISOString().split("T")[0],
  });

  const handleChange = (name: string, value: string) => {
    setLoadInfo((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const loadStatuses = [
    "open",
    "accepted",
    "enroute",
    "delivered",
    "closed",
    "rejected",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".update-load-form")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl update-load-form">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
          Update Load
        </h2>
        <Form method="post" className="space-y-6">
          <input type="hidden" name="loadId" value={loadId} />
          <input type="hidden" name="userId" value={userId} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              name="origin"
              placeholder={loadInfo.origin}
              defaultValue={loadInfo.origin}
              onChange={handleChange}
              required
            />
            <FloatingLabelInput
              name="destination"
              placeholder={loadInfo.destination}
              defaultValue={loadInfo.destination}
              onChange={handleChange}
              required
            />
            <div className="relative">
              <select
                name="loadStatus"
                value={loadInfo.loadStatus}
                onChange={(e) => handleChange("loadStatus", e.target.value)}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="" disabled>
                  Select Status
                </option>
                {loadStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600">
                Load Status
              </label>
            </div>
            <FloatingLabelInput
              name="weight"
              placeholder={loadInfo.weight}
              type="number"
              defaultValue={loadInfo.weight}
              onChange={handleChange}
              required
            />
            <FloatingLabelInput
              name="offerAmount"
              placeholder={`Offer Amount ${loadInfo.offerAmount} (ETB)`}
              type="number"
              defaultValue={loadInfo.offerAmount}
              onChange={handleChange}
              required
            />
            <FloatingLabelInput
              name="commodity"
              placeholder={`Load Type: ${loadInfo.commodity}`}
              defaultValue={loadInfo.commodity}
              onChange={handleChange}
              required
            />
            <DateInput
              name="pickupDate"
              label="Pickup Date"
              defaultValue={loadInfo.pickupDate}
              onChange={handleChange}
              min={today}
              required
            />
            <DateInput
              name="deliveryDate"
              label="Est. Delivery Date"
              defaultValue={loadInfo.deliveryDate}
              onChange={handleChange}
              min={today}
              required
            />
          </div>

          <div className="col-span-2">
            <textarea
              className="w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              name="loadDetails"
              placeholder={loadInfo.loadDetails}
              defaultValue={loadInfo.loadDetails}
              onChange={handleChange}
              required
              as="textarea"
              rows={4}
            />
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              name="_action"
              value="save_changes"
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader /> : "Update Load"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
