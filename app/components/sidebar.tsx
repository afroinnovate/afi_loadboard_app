import { NavLink } from "@remix-run/react";

const sidebarLinks = [
  { name: 'Overview', to: '/dashboard'},
  { name: 'View Loads', to: '/dashboard/viewloads' },
  { name: 'Add Loads', to: '/dashboard/addloads' },
  { name: 'Bids', to: '/dashboard/bidsloads' },
  // ... other sub-task links
];

export default function Sidebar() {
  return (
    <aside className="w-64 shadow-lg h-screen overflow-y-auto py-4 px-3 bg-gray-200 text-black rounded" aria-label="Sidebar">
      <ul className="space-y-2 pl-4">
        {sidebarLinks.map((link) => (
          <li key={link.name}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center p-2 text-base font-normal text-black rounded-lg bg-gray-300"
                  : "flex items-center p-2 text-base font-normal text-black rounded-lg hover:bg-gray-100 dark:hover:bg-gray-400"
              }
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
