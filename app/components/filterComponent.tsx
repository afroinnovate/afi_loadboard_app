import React from "react";
import { Form } from "@remix-run/react";
import { CameraIcon } from "@heroicons/react/20/solid";

interface FilterComponentProps {
  filterConfig: {
    status: string;
    minAmount: string;
    origin: string;
    destination: string;
  };
  filteredLoadsCount: number;
  totalLoadsCount: number;
  isSubmitting: boolean;
  onClear: () => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  filterConfig,
  filteredLoadsCount,
  totalLoadsCount,
  isSubmitting,
  onClear,
}) => {
  return (
    <Form method="post" className="mb-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <CameraIcon className="w-5 h-5 text-green-400" />
        <select
          name="status"
          defaultValue={filterConfig.status}
          className="p-2 rounded bg-gray-700 border-green-600 text-white"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="accepted">Accepted</option>
          <option value="delivered">Delivered</option>
          <option value="rejected">Rejected</option>
          <option value="enroute">En Route</option>
        </select>
        <input
          type="number"
          name="minAmount"
          defaultValue={filterConfig.minAmount}
          placeholder="Min Amount"
          className="p-2 rounded bg-gray-700 border-green-600 text-white"
        />
        <input
          type="text"
          name="origin"
          defaultValue={filterConfig.origin}
          placeholder="Origin"
          className="p-2 rounded bg-gray-700 border-green-600 text-white"
        />
        <input
          type="text"
          name="destination"
          defaultValue={filterConfig.destination}
          placeholder="Destination"
          className="p-2 rounded bg-gray-700 border-green-600 text-white"
        />
        <button
          type="button"
          onClick={onClear}
          name="_action"
          value="clear"
          className="p-2 rounded text-green-400 hover:text-green-300 border border-green-600"
        >
          Clear Filters
        </button>
      </div>
      <div className="text-sm text-green-400">
        {isSubmitting
          ? "Filtering..."
          : `Showing ${filteredLoadsCount} of ${totalLoadsCount} loads`}
      </div>
    </Form>
  );
};

export default FilterComponent;
