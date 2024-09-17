import React from "react";

export default function VehicleForm({
  selectedVehicle,
  theme = "light",
}: {
  selectedVehicle: string;
  theme?: "light" | "dark";
}) {
  const themeClasses = {
    container:
      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black",
    header: theme === "dark" ? "text-green-400" : "text-green-700",
    label: theme === "dark" ? "text-gray-300" : "text-gray-700",
    input:
      theme === "dark"
        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-blue-500",
    select:
      theme === "dark"
        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
        : "bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-blue-500",
    checkbox:
      theme === "dark"
        ? "text-blue-500 border-gray-600 focus:ring-blue-600"
        : "text-blue-600 border-gray-300 focus:ring-blue-500",
    checkboxLabel: theme === "dark" ? "text-gray-300" : "text-gray-900",
  };

  const truckLengths = ["20", "40", "53", "60"];
  const capacities = ["10000", "20000", "30000", "40000", "50000"];
  const colors = [
    "White",
    "Black",
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Silver",
    "Other",
  ];

  return (
    <div
      className={`p-6 rounded-lg shadow-lg max-w-full mt-6 space-y-4 ${themeClasses.container}`}
    >
      <h3 className={`text-lg font-semibold ${themeClasses.header}`}>
        Enter {selectedVehicle} Details
      </h3>

      {/* Conditional rendering for Truck Types */}
      {selectedVehicle === "Trucks" && (
        <div>
          <label className={`block text-sm font-medium ${themeClasses.label}`}>
            Truck Type
          </label>
          <select
            name="vehicleName"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${themeClasses.select}`}
            required
          >
            <option value="">Select Truck Type</option>
            <option value="Flatbed">Flatbed</option>
            <option value="Dry Van">Dry Van</option>
            <option value="Refrigerated">Refrigerated</option>
            <option value="Tanker">Tanker</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )}

      {/* Conditional rendering for Boat Types */}
      {selectedVehicle === "Boats" && (
        <div>
          <label className={`block text-sm font-medium ${themeClasses.label}`}>
            Boat Type
          </label>
          <select
            name="vehicleName"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${themeClasses.select}`}
            required
          >
            <option value="">Select Boat Type</option>
            <option value="Full Length">Full Length</option>
            <option value="Semi">Semi</option>
            <option value="Speed Boat">Speed Boat</option>
          </select>
        </div>
      )}

      {/* Conditional rendering for Truck Length */}
      {selectedVehicle === "Trucks" && (
        <div>
          <label className={`block text-sm font-medium ${themeClasses.label}`}>
            Truck Length (in feet)
          </label>
          <select
            name="truckLength"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${themeClasses.select}`}
            required
          >
            <option value="">Select Truck Length</option>
            {truckLengths.map((length) => (
              <option key={length} value={length}>
                {length} feet
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={`block text-sm font-medium ${themeClasses.label}`}>
          Capacity (in kg)
        </label>
        <select
          name="vehicleCapacity"
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${themeClasses.select}`}
          required
        >
          <option value="">Select Capacity</option>
          {capacities.map((capacity) => (
            <option key={capacity} value={capacity}>
              {capacity} kg
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={`block text-sm font-medium ${themeClasses.label}`}>
          Color
        </label>
        <select
          name="vehicleColor"
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${themeClasses.select}`}
          required
        >
          <option value="">Select Color</option>
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={`block text-sm font-medium ${themeClasses.label}`}>
          {selectedVehicle === "Trucks"
            ? "Truck Number (VIN)"
            : selectedVehicle === "Boats"
            ? "Boat Number"
            : "Van Number (VIN)"}
        </label>
        <input
          type="text"
          name="registrationNumber"
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${themeClasses.input}`}
          placeholder={
            selectedVehicle === "Trucks"
              ? "Enter Truck Number"
              : selectedVehicle === "Boats"
              ? "Enter Boat Number"
              : "Enter VIN"
          }
          required
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input
            id="hasInsurance"
            name="hasInsurance"
            type="checkbox"
            className={`h-4 w-4 rounded ${themeClasses.checkbox}`}
          />
          <label
            htmlFor="hasInsurance"
            className={`ml-2 block text-sm ${themeClasses.checkboxLabel}`}
          >
            Has Insurance
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="hasInspection"
            name="hasInspection"
            type="checkbox"
            className={`h-4 w-4 rounded ${themeClasses.checkbox}`}
          />
          <label
            htmlFor="hasInspection"
            className={`ml-2 block text-sm ${themeClasses.checkboxLabel}`}
          >
            Has Inspection
          </label>
        </div>
      </div>
    </div>
  );
}
