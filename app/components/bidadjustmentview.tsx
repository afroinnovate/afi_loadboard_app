// BidAdjustmentView.jsx
import { useNavigation } from '@remix-run/react';
import React, { useEffect, useRef, useState } from 'react';

const BidAdjustmentView = ({ loadId, initialBid }) => {
     // Initialize the bidAmount state with the initialBid value
  const [bidAmount, setBidAmount] = useState(initialBid);
  const [isEditing, setIsEditing] = useState(false); // Track if the bid amount is being edited
  const popupRef = useRef(null); // Ref for the popup

  const handleBidChange = (event) => {
    setBidAmount(event.target.value);
  };

  const navigation = useNavigation();
  const isPlacing = navigation.state === "submitting";

  // Close popup on click outside
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg p-4" ref={popupRef}>
        <h3 className="text-lg font-bold">Adjust Your Bid</h3>
        <div>
          <input
            type="range"
            min={initialBid - 100}
            max={initialBid + 1000}
            value={bidAmount}
            onChange={handleBidChange}
            className="w-full p-2"
          />
          {isEditing ? (
            <input
              type="number"
              value={bidAmount}
              onChange={handleBidChange}
              onBlur={() => setIsEditing(false)}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  setIsEditing(false);
                }
              }}
              autoFocus
              className="w-full text-center mt-2 p-2"
            />
          ) : (
            <div className="text-center mt-2 cursor-pointer" onClick={() => setIsEditing(true)}>
              {`Current Bid: $${bidAmount}`}
            </div>
          )}
        </div>
        <div className="flex justify-between mt-4 p-2">
            <form method="post">
                <input type="hidden" name="loadId" value={loadId} />
                <input type="hidden" name="bidAmount" value={bidAmount} />
                <button
                  type='submit'
                  name='_action'
                  value='placebid'
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                  {isPlacing ? "Placing the bid..." : "Place Bid"}
                </button>
                <button
                  type="submit"
                  name="_action"
                  value="closeContact"
                  className="flex-1 bg-gray-500 hover:bg-gray-700 text-white m-2 font-bold py-2 px-4 rounded"
                >
                  Close
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default BidAdjustmentView;