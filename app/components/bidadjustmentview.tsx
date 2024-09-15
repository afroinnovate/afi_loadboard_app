// BidAdjustmentView.jsx
import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { useRef, useState } from "react";

const BidAdjustmentView = ({ loadId, initialBid, onClose }: { loadId: string, initialBid: number, onClose: () => void }) => {
  const [bidAmount, setBidAmount] = useState(initialBid);
  const popupRef = useRef(null);
  const navigation = useNavigation();
  const submit = useSubmit();
  const isPlacing = navigation.state === "submitting";

  const handleBidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBidAmount(parseFloat(event.target.value));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(event.currentTarget, { method: "post" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-gray-200 text-green-900 rounded-lg p-4" ref={popupRef}>
        <h3 className="text-lg font-bold">Adjust Your Bid</h3>
        <Form method="post" onSubmit={handleSubmit}>
          <input type="hidden" name="bidId" value={loadId} />
          <input type="hidden" name="action" value="save" />
          <div>
            <input
              type="number"
              name="bidAmount"
              min={0}
              max={1000000}
              step={10.0}
              value={bidAmount}
              onChange={handleBidChange}
              placeholder={`Current Bid: $${initialBid}`}
              autoFocus
              className="w-full text-center mt-2 p-2"
            />
          </div>
          <div className="flex justify-between mt-4 p-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={isPlacing}
            >
              {isPlacing ? "Updating..." : "Update Bid"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-700 text-white m-2 font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default BidAdjustmentView;
