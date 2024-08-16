export default function VehicleForm({
  selectedVehicle,
}: {
  selectedVehicle: string;
}) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-full mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-green-700">
        Enter {selectedVehicle} Details
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Vehicle Name
        </label>
        <input
          type="text"
          name="vehicleName"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter vehicle name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Capacity (in kg)
        </label>
        <input
          type="number"
          name="vehicleCapacity"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter capacity"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <input
          type="text"
          name="vehicleColor"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter color"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Registration Number (VIN)
        </label>
        <input
          type="text"
          name="registrationNumber"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter VIN"
          required
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input
            id="hasInsurance"
            name="hasInsurance"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="hasInsurance"
            className="ml-2 block text-sm text-gray-900"
          >
            Has Insurance
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="hasInspection"
            name="hasInspection"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="hasInspection"
            className="ml-2 block text-sm text-gray-900"
          >
            Has Inspection
          </label>
        </div>
      </div>
    </div>
  );
}
