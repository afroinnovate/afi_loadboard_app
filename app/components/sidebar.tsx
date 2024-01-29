// app/components/Sidebar.tsx
import { Link } from "@remix-run/react";

const sidebarLinks = [
  { name: 'View Loads', to: '/dashboard/loads/view' },
  { name: 'Add Loads', to: '/dashboard/loads/add' },
  { name: 'Bids', to: '/dashboard/loads/bids' },
  // ... other sub-task links
];

export default function Sidebar() {
  return (
    <aside className="w-64" aria-label="Sidebar">
      <div className="overflow-y-auto py-4 px-3 bg-gray-50 rounded dark:bg-gray-800">
        <ul className="space-y-2">
          {sidebarLinks.map((link) => (
            <li key={link.name}>
              <Link to={link.to} className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
