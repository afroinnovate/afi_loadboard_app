import React from "react";
import { Link } from "react-router-dom";
import { Truck, DollarSign, Package, Clock } from "lucide-react";

export default function CarrierDashboard() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-500">
          Pick your Load and Hit the Road
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickLinkCard
            title="Available Loads"
            description="Browse and bid on available shipments"
            link="/carriers/dashboard/view"
            icon={<Package />}
          />
          <QuickLinkCard
            title="My Bids"
            description="Manage your current bids"
            link="/carriers/dashboard/"
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
              <BidItem
                route="Dallas, TX → Houston, TX"
                date="8/18/2024"
                amount="ETB 2600"
                status="Open"
              />
              {/* Add more bid items here */}
            </ul>
          </DashboardCard>

          <DashboardCard title="Quick Stats">
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Completed Loads" value="28" />
              <Stat label="Active Bids" value="5" />
              <Stat label="Revenue This Month" value="$45,320" />
              <Stat label="On-Time Deliveries" value="98%" />
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
