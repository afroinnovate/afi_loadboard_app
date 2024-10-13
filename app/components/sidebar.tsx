import { NavLink } from "@remix-run/react";

const sidebarLinks = [
  { name: "Overview", to: "/shipper/dashboard/" },
  { name: "View Loads", to: "/shipper/dashboard/loads/view/" },
  { name: "Add Loads", to: "/shipper/dashboard/loads/add/" },
  { name: "Bids", to: "/shipper/dashboard/loads/bids/" },
  // ... other sub-task links
];

export default function Sidebar({ activeSection, theme, isAuthenticated, userType }: { activeSection: string, theme: string, isAuthenticated: boolean, userType: string }) {
  if (!isAuthenticated || userType !== "shipper") return null;

  var renderingLinks = sidebarLinks;
  if (activeSection === "home") {
    renderingLinks = [{ name: "Overview", to: "/shipper/dashboard/" }];
  }

  const themeClasses = {
    header: theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200",
    headerText: theme === "dark" ? "text-gray-200" : "text-gray-800",
    headerHover: theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200",
    activeLink: theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-300 text-gray-900",
    inactiveLink: theme === "dark" ? "text-gray-400" : "text-gray-600",
    iconColor: theme === "dark" ? "text-white" : "text-gray-600", // Changed to white for dark theme
    iconHover: theme === "dark" ? "group-hover:text-white" : "group-hover:text-gray-900",
  };
  
  return (
    <aside className={`w-64 shadow-lg h-screen overflow-y-auto py-4 px-3 ${themeClasses.header} rounded`} aria-label="Sidebar">
      <ul className="space-y-2">
        {renderingLinks.map((link) => (
          <li key={link.name}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `flex items-center p-2 text-base font-normal rounded-lg ${themeClasses.headerHover} group transition-colors duration-200 ${
                  isActive ? themeClasses.activeLink : themeClasses.inactiveLink
                }`
              }
            >
              {link.name === 'Overview' && (
                <svg className={`h-6 w-6 mr-3 ${themeClasses.iconColor} ${themeClasses.iconHover} transition-colors duration-200`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
              )}
              {link.name.startsWith('View') && (
                <svg className={`h-6 w-6 mr-3 ${themeClasses.iconColor} ${themeClasses.iconHover} transition-colors duration-200`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                </svg>
              )}
              {link.name.startsWith('Add') && (
                <svg className={`h-6 w-6 mr-3 ${themeClasses.iconColor} ${themeClasses.iconHover} transition-colors duration-200`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                </svg>
              )}
              {link.name.startsWith('Bids') && (
                <svg className={`h-6 w-6 mr-3 ${themeClasses.iconColor} ${themeClasses.iconHover} transition-colors duration-200`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd"></path>
                  <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"></path>
                </svg>
              )}
              <span className="flex-1 ml-3 whitespace-nowrap">{link.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
