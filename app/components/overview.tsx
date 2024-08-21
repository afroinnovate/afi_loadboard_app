import React from "react";
import { Link } from "@remix-run/react";

const Overview = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-400">
          Dashboard Overview
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickLinkCard
            title="Post a Load"
            description="Create a new shipment request"
            link="/dashboard/loads/add"
            icon="📦"
          />
          <QuickLinkCard
            title="View Loads"
            description="Manage your active and past shipments"
            link="/dashboard/loads/view"
            icon="🚚"
          />
          <QuickLinkCard
            title="Bids"
            description="Review and manage carrier bids"
            link="/dashboard/bids"
            icon="💰"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Recent Activity">
            <ul className="space-y-2">
              <li className="flex justify-between items-center">
                <span>New bid received for Load #12345</span>
                <span className="text-sm text-gray-400">2 hours ago</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Load #67890 picked up</span>
                <span className="text-sm text-gray-400">5 hours ago</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Payment processed for Load #54321</span>
                <span className="text-sm text-gray-400">1 day ago</span>
              </li>
            </ul>
          </DashboardCard>

          <DashboardCard title="Quick Stats">
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Active Loads" value="12" />
              <Stat label="Pending Bids" value="5" />
              <Stat label="Completed This Month" value="28" />
              <Stat label="Total Revenue" value="$45,320" />
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

const QuickLinkCard = ({ title, description, link, icon }) => (
  <Link
    to={link}
    className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300"
  >
    <div className="flex items-center mb-4">
      <span className="text-4xl mr-4">{icon}</span>
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
    <p className="text-2xl font-bold text-red-400">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

export default Overview;
