import React from "react";
import { Link } from "@remix-run/react";

// Update the interface definitions
interface Load {
  loadId: number;
  origin: string;
  destination: string;
  createdAt: string;
  loadStatus: string;
}

interface Bid {
  bidStatus: number;
  // Add other relevant fields
}

interface BidObj {
  load: Load;
  bids: Bid[];
}

interface ThemeClasses {
  cardBg: string;
  cardHover: string;
  mutedText: string;
  statValue: string;
}

const Overview = ({
  loads,
  bidsDict,
  theme,
}: {
  loads: Load[];
  bidsDict: BidObj[];
  theme: string;
}) => {
  const themeClasses = {
    header:
      theme === "dark"
        ? "bg-gray-800 border-gray-700"
        : "bg-gray-100 border-gray-200",
    headerText: theme === "dark" ? "text-gray-200" : "text-gray-800",
    headerHover: theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200",
    activeLink:
      theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-300 text-gray-900",
    inactiveLink: theme === "dark" ? "text-gray-400" : "text-gray-600",
    iconColor: theme === "dark" ? "text-white" : "text-gray-600",
    iconHover:
      theme === "dark" ? "group-hover:text-white" : "group-hover:text-gray-900",
    // Add new theme classes
    background: theme === "dark" ? "bg-gray-900" : "bg-gray-100",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    cardBg: theme === "dark" ? "bg-gray-800" : "bg-white",
    cardHover: theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50",
    statValue: theme === "dark" ? "text-red-400" : "text-red-600",
    mutedText: theme === "dark" ? "text-gray-400" : "text-gray-500",
  };

  // Calculate the statistics
  const activeLoads = loads.filter(
    (load) => load.loadStatus === "En Route"
  ).length;
  const pendingBids = bidsDict.reduce(
    (total, bidObj) =>
      total + bidObj.bids.filter((bid) => bid.bidStatus === 0).length,
    0
  );
  const activeBids = bidsDict.reduce(
    (total, bidObj) =>
      total +
      bidObj.bids.filter((bid) => bid.bidStatus === 2).length,
    0
  );

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const completedThisMonth = loads.filter((load) => {
    const loadDate = new Date(load.createdAt);
    return (
      load.loadStatus === "Completed" &&
      loadDate.getMonth() === currentMonth &&
      loadDate.getFullYear() === currentYear
    );
  }).length;

  // Sort loads by creation date, most recent first, and limit to 3 items
  const recentLoads = [...loads]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  return (
    <div
      className={`${themeClasses.background} ${themeClasses.text} min-h-screen`}
    >
      <div className="container mx-auto px-4 py-8">
        <h1
          className={`text-3xl font-bold mb-8 text-center ${themeClasses.statValue}`}
        >
          Dashboard Overview
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickLinkCard
            title="Post a Load"
            description="Create a new shipment request"
            link="/shipper/dashboard/loads/add"
            icon="📦"
            theme={themeClasses}
          />
          <QuickLinkCard
            title="View Loads"
            description="Manage your active and past shipments"
            link="/shipper/dashboard/loads/view"
            icon="🚚"
            theme={themeClasses}
          />
          <QuickLinkCard
            title="Bids"
            description="Review and manage carrier bids"
            link="/shipper/dashboard/loads/bids"
            icon="💰"
            theme={themeClasses}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Recent Activity" theme={themeClasses}>
            <ul className="space-y-3">
              {recentLoads.map((load) => (
                <li key={load.loadId}>
                  <Link
                    to={`/shipper/dashboard/loads/view`}
                    className={`block ${themeClasses.cardBg} p-3 rounded-lg ${themeClasses.cardHover} transition duration-300`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-medium text-sm ${themeClasses.text}`}
                      >
                        {load.origin} to {load.destination}
                      </span>
                      <span className={`text-xs ${themeClasses.mutedText}`}>
                        {formatRelativeTime(new Date(load.createdAt))}
                      </span>
                    </div>
                    <p className={`mt-1 text-xs ${themeClasses.mutedText}`}>
                      Status: {load.loadStatus}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard title="Quick Stats" theme={themeClasses}>
            <div className="grid grid-cols-2 gap-4">
              <Stat
                label="Active Loads"
                value={activeLoads.toString()}
                theme={themeClasses}
                link="/shipper/dashboard/loads/view"
              />
              <Stat
                label="Pending Bids"
                value={pendingBids.toString()}
                theme={themeClasses}
                link="/shipper/dashboard/loads/bids"
              />
              <Stat
                label="Completed This Month"
                value={completedThisMonth.toString()}
                theme={themeClasses}
                link="/shipper/dashboard/loads/view"
              />
              <Stat
                label="Active Bids"
                value={activeBids.toString()}
                theme={themeClasses}
                link="/shipper/dashboard/loads/bids"
              />
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

const QuickLinkCard = ({
  title,
  description,
  link,
  icon,
  theme,
}: {
  title: string;
  description: string;
  link: string;
  icon: string;
  theme: ThemeClasses;
}) => (
  <Link
    to={link}
    className={`${theme.cardBg} p-6 rounded-lg shadow-lg ${theme.cardHover} transition duration-300`}
  >
    <div className="flex items-center mb-4">
      <span className="text-4xl mr-4">{icon}</span>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className={theme.mutedText}>{description}</p>
  </Link>
);

const DashboardCard = ({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: ThemeClasses;
}) => (
  <div className={`${theme.cardBg} p-6 rounded-lg shadow-lg`}>
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const Stat = ({
  label,
  value,
  theme,
  link,
}: {
  label: string;
  value: string;
  theme: ThemeClasses;
  link: string;
}) => (
  <div className="text-center">
    <Link to={link} className="group">
      <p
        className={`text-2xl font-bold ${theme.statValue} group-hover:underline`}
      >
        {value}
      </p>
      <p className={`text-sm ${theme.mutedText} group-hover:underline`}>
        {label}
      </p>
    </Link>
  </div>
);

// Add this helper function at the end of the file
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export default Overview;
