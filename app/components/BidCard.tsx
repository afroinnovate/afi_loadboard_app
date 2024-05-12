import { FC, useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, LockClosedIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";

type BidCardProps = {
    bid: {
        id: number;
        loadId: number;
        carrierId: string;
        bidAmount: number;
        bidStatus: number;
        biddingTime: string;
        updatedAt: string;
        updatedBy: string;
        load: any;
        carrier: any;
    },
    shipperHasAccess: boolean;
};

export const BidCard: FC<BidCardProps> = ({ bid, shipperHasAccess }) => {
    const [isOpen, setIsOpen] = useState(false); // State to manage the open/closed state of the collapsible
    
    return (
        <Disclosure as="div" className="bg-white shadow-md rounded-lg mb-4">
             {({ open }) => (
                <>
                    <Disclosure.Button 
                        className="flex justify-around w-full p-4 text-sm font-bold text-left text-blue-500 bg-blue-100 hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span>{`Load ID: ${bid.loadId}`}</span>
                        <span>{`$${bid.bidAmount}`}</span>  
                        <span> {`${bid.carrier.email}`}</span>
                        <ChevronUpIcon
                            className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-purple-500`}
                        />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pt-4 pb-4 text-sm text-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <p><span className="font-bold p-6">Bid By:</span> <span className='text-blue-600 itallic'>{bid.carrier.email}</span></p>
                            <p><span className="font-bold">Company:</span> {bid.carrier.companyName}</p>
                            <p><span className="font-bold">Phone Number:</span> {bid.carrier.phoneNumber}</p>
                            <p><span className="font-bold p-6">Bid Amount:</span> ${bid.bidAmount}</p>
                            <p><span className="font-bold">Bid Status:</span> {['Pending', 'Accepted', 'Rejected'][bid.bidStatus]}</p>
                            <p><span className="font-bold">Bidding Time:</span> {new Date(bid.biddingTime).toLocaleString()}</p>
                        </div>
                        {shipperHasAccess && (
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" name="action" value="accept" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                                <CheckCircleIcon className="w-5 h-5 mr-2 inline" aria-hidden="true" />
                                Accept
                                </button>
                                <button type="button" name="action" value="reject" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                <XCircleIcon className="w-5 h-5 mr-2 inline" aria-hidden="true" />
                                Reject
                                </button>
                                <button type="button" name="action" value="abandon" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                                <LockClosedIcon className="w-5 h-5 mr-2 inline" aria-hidden="true" />
                                Abandon
                                </button>
                            </div>
                        )}
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
};
