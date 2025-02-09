import React from "react";
import { Link } from "react-router-dom";
import { Truck, DollarSign, Package } from "lucide-react";
import { NavLink, useNavigate } from "@remix-run/react";
import { Loader } from "~/components/loader";

const mapStatus = {
  0: "Open",
  1: "Accepted",
  2: "Rejected",
  3: "Completed",
};

interface CarrierOverviewProps {
  loads: any[];
  bids: any[];
  loadCounts: {
    available: number;
    pending: number;
    assigned: number;
    in_transit: number;
    delivered: number;
    cancelled: number;
    completed: number;
  };
  bidCounts: {
    pending: number;
    accepted: number;
    rejected: number;
    cancelled: number;
  };
  theme: string;
  invoices: any[];
  isLoading?: boolean;
}

export default function CarrierOverview({
  loads,
  bids,
  loadCounts,
  bidCounts,
  theme,
  invoices,
  isLoading = false,
}: CarrierOverviewProps) {
  const navigate = useNavigate();
  console.log("Theme", theme);

  // Count completed loads (status === "completed")
  const completedLoads = loads.filter(
    (load: any) => load.loadStatus?.toLowerCase() === "completed"
  ).length;

  // Count completed invoices separately
  const completedInvoices =
    invoices?.filter((invoice) => invoice.status?.toLowerCase() === "completed")
      .length || 0;

  const openLoads = loads.filter(
    (load: any) => load.loadStatus?.toLowerCase() === "open"
  ).length;

  const activeBids = bids.filter((bid: any) => bid.bidStatus === 0).length;
  const revenue = bids
    .filter((bid: any) => bid.bidStatus === 1)
    .reduce((total: any, bid: any) => total + bid.bidAmount, 0);

  const latestBid = bids.sort(
    (a: any, b: any) =>
      new Date(b.biddingTime).getTime() - new Date(a.biddingTime).getTime()
  )[0];

  const themeClasses = {
    background: theme === "dark" ? "bg-gray-900" : "bg-white",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    cardBackground: theme === "dark" ? "bg-gray-800" : "bg-gray-100",
    cardHover: theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200",
    accent: theme === "dark" ? "text-green-500" : "text-green-600",
    subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
    bidItemBackground: theme === "dark" ? "bg-gray-700" : "bg-gray-200",
    cardShadow: theme === "dark" ? "shadow-lg" : "shadow-md shadow-gray-400", // Updated shadow for light theme
    linkHover: theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-200",
    linkTextHover:
      theme === "dark" ? "hover:text-green-400" : "hover:text-green-700",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={40} />
      </div>
    );
  }

  return (
    <div
      className={`${themeClasses.background} ${themeClasses.text} min-h-screen`}
    >
      <main className="container mx-auto px-4 py-8">
        <h2
          className={`text-2xl font-bold mb-6 text-center ${themeClasses.accent}`}
        >
          Pick your Load and Hit the Road
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickLinkCard
            title="Available Open Loads"
            description="Browse and bid on available shipments"
            link="/carriers/dashboard/view"
            icon={<Package />}
            themeClasses={themeClasses}
          />
          <QuickLinkCard
            title="My Bids"
            description="Manage your current bids"
            link="/carriers/dashboard/bid/"
            icon={<DollarSign />}
            themeClasses={themeClasses}
          />
          <QuickLinkCard
            title="Active Shipments"
            description="View and update your ongoing shipments"
            link="/carriers/dashboard/"
            icon={<Truck />}
            themeClasses={themeClasses}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Recent Bids" themeClasses={themeClasses}>
            <ul className="space-y-2">
              {latestBid && (
                <BidItem
                  route={`${latestBid.load.origin} → ${latestBid.load.destination}`}
                  date={new Date(latestBid.biddingTime).toLocaleDateString()}
                  amount={`ETB ${latestBid.bidAmount}`}
                  status={
                    mapStatus[latestBid.bidStatus as keyof typeof mapStatus]
                  }
                  themeClasses={themeClasses}
                />
              )}
            </ul>
          </DashboardCard>

          <DashboardCard title="Quick Stats" themeClasses={themeClasses}>
            <div className="grid grid-cols-2 gap-4">
              <StatLink
                label="Open Loads"
                value={openLoads}
                link="/carriers/dashboard/view"
                themeClasses={themeClasses}
              />
              <StatLink
                label="Active Bids"
                value={activeBids}
                link="/carriers/dashboard/bid/"
                themeClasses={themeClasses}
              />
              <Stat
                label="Completed Loads"
                value={completedLoads}
                themeClasses={themeClasses}
              />
              <Stat
                label="Revenue"
                value={`$${revenue.toLocaleString()}`}
                themeClasses={themeClasses}
              />
              <StatLink
                label="Completed Invoices"
                value={completedInvoices}
                link="/carriers/dashboard/invoices"
                themeClasses={themeClasses}
              />
            </div>
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <StatusCard
            title="Available Loads"
            count={loadCounts.available}
            theme={theme}
          />
          <StatusCard
            title="Assigned Loads"
            count={loadCounts.assigned}
            theme={theme}
          />
          <StatusCard
            title="In Transit"
            count={loadCounts.in_transit}
            theme={theme}
          />
          <StatusCard
            title="Delivered"
            count={loadCounts.delivered}
            theme={theme}
          />
          {/* Add more status cards as needed */}
        </div>
      </main>
    </div>
  );
}

const QuickLinkCard = ({
  title,
  description,
  link,
  icon,
  themeClasses,
}: {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  themeClasses: any;
}) => (
  <Link
    to={link}
    className={`${themeClasses.cardBackground} p-6 rounded-lg ${themeClasses.cardShadow} ${themeClasses.linkHover} transition duration-300`}
  >
    <div className="flex items-center mb-4">
      <span className={themeClasses.accent + " mr-4"}>{icon}</span>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className={themeClasses.subtext}>{description}</p>
  </Link>
);

const DashboardCard = ({
  title,
  children,
  themeClasses,
}: {
  title: string;
  children: React.ReactNode;
  themeClasses: any;
}) => (
  <div className={`${themeClasses.cardBackground} p-6 rounded-lg shadow-lg`}>
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const Stat = ({
  label,
  value,
  themeClasses,
}: {
  label: string;
  value: string;
  themeClasses: any;
}) => (
  <div className="text-center">
    <p className={`text-2xl font-bold ${themeClasses.accent}`}>{value}</p>
    <p className={`text-sm ${themeClasses.subtext}`}>{label}</p>
  </div>
);

const StatLink = ({
  label,
  value,
  link,
  themeClasses,
}: {
  label: string;
  value: string;
  link: string;
  themeClasses: any;
}) => (
  <Link to={link} className={`text-center ${themeClasses.linkTextHover}`}>
    <p className={`text-2xl font-bold ${themeClasses.accent}`}>{value}</p>
    <p className={`text-sm ${themeClasses.subtext}`}>{label}</p>
  </Link>
);

const BidItem = ({
  route,
  date,
  amount,
  status,
  themeClasses,
}: {
  route: string;
  date: string;
  amount: string;
  status: string;
  themeClasses: any;
}) => (
  <NavLink
    className={({ isActive }) =>
      `flex justify-between items-center ${
        themeClasses.bidItemBackground
      } p-3 rounded ${themeClasses.linkHover} transition duration-300 ho ${
        isActive ? themeClasses.accent : ""
      }`
    }
    to={`/carriers/dashboard/bid`}
  >
    <div>
      <p className="font-semibold">{route}</p>
      <p className={`text-sm ${themeClasses.subtext}`}>{date}</p>
    </div>
    <div className="text-right">
      <p className="font-semibold">{amount}</p>
      <p
        className={`text-sm ${
          status === "Open" ? themeClasses.accent : "text-yellow-500"
        }`}
      >
        {status}
      </p>
    </div>
  </NavLink>
);

function StatusCard({
  title,
  count,
  theme,
}: {
  title: string;
  count: number;
  theme: string;
}) {
  const themeClasses = {
    card: theme === "dark" ? "bg-gray-800" : "bg-white",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
  };

  return (
    <div
      className={`${themeClasses.card} ${themeClasses.border} border rounded-lg p-4 shadow-sm`}
    >
      <h3 className={`${themeClasses.text} text-lg font-semibold`}>{title}</h3>
      <p className={`${themeClasses.text} text-3xl font-bold mt-2`}>{count}</p>
    </div>
  );
}