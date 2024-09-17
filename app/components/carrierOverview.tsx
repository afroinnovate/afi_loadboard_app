import React from "react";
import { Link } from "react-router-dom";
import { Truck, DollarSign, Package } from "lucide-react";

export default function CarrierDashboard({ loads, bids }: { loads: any, bids: any }) {
  const openLoads = loads.filter((load: any) => load.loadStatus === "Open").length;
  const activeBids = bids.filter((bid: any) => bid.bidStatus === 0).length;
  const completedLoads = bids.filter((bid: any) => bid.bidStatus === 1).length;
  const revenue = bids
    .filter((bid: any) => bid.bidStatus === 1)
    .reduce((total: any, bid: any) => total + bid.bidAmount, 0);

  const latestBid = bids.sort((a: any, b: any) => 
    new Date(b.biddingTime).getTime() - new Date(a.biddingTime).getTime()
  )[0];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-500">
          Pick your Load and Hit the Road
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickLinkCard
            title="Available Open Loads"
            description="Browse and bid on available shipments"
            link="/carriers/dashboard/view"
            icon={<Package />}
          />
          <QuickLinkCard
            title="My Bids"
            description="Manage your current bids"
            link="/carriers/dashboard/bid/"
            icon={<DollarSign />}
          />
          <QuickLinkCard
            title="Active Shipments"
            description="View and update your ongoing shipments"
            link="/carriers/dashboard/"
            icon={<Truck />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Recent Bids">
            <ul className="space-y-2">
              {latestBid && (
                <BidItem
                  route={`${latestBid.load.origin} → ${latestBid.load.destination}`}
                  date={new Date(latestBid.biddingTime).toLocaleDateString()}
                  amount={`ETB ${latestBid.bidAmount}`}
                  status={latestBid.bidStatus === 0 ? "Open" : "Closed"}
                />
              )}
            </ul>
          </DashboardCard>

          <DashboardCard title="Quick Stats">
            <div className="grid grid-cols-2 gap-4">
              <StatLink
                label="Open Loads"
                value={openLoads}
                link="/carriers/dashboard/view"
              />
              <StatLink
                label="Active Bids"
                value={activeBids}
                link="/carriers/dashboard/bid/"
              />
              <Stat label="Completed Loads" value={completedLoads} />
              <Stat label="Revenue" value={`$${revenue.toLocaleString()}`} />
            </div>
          </DashboardCard>
        </div>
      </main>
    </div>
  );
}

const QuickLinkCard = ({ title, description, link, icon }) => (
  <Link
    to={link}
    className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300"
  >
    <div className="flex items-center mb-4">
      <span className="text-green-500 mr-4">{icon}</span>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-gray-400">{description}</p>
  </Link>
);

const DashboardCard = ({ title, children }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const Stat = ({ label, value }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-green-500">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

const StatLink = ({ label, value, link }) => (
  <Link to={link} className="text-center hover:text-green-400">
    <p className="text-2xl font-bold text-green-500">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </Link>
);

const BidItem = ({ route, date, amount, status }) => (
  <li className="flex justify-between items-center bg-gray-700 p-3 rounded">
    <div>
      <p className="font-semibold">{route}</p>
      <p className="text-sm text-gray-400">{date}</p>
    </div>
    <div className="text-right">
      <p className="font-semibold">{amount}</p>
      <p
        className={`text-sm ${
          status === "Open" ? "text-green-500" : "text-yellow-500"
        }`}
      >
        {status}
      </p>
    </div>
  </li>
);
