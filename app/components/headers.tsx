// app/components/Header.tsx
import { Form, Link, useLocation } from "@remix-run/react";

export default function Header({ user }) {
  const location = useLocation();

  let navigationLink;

  // Determine the navigation link based on the user's authentication status and current location
  if (user || location.pathname.startsWith('/dashboard/')) {
    navigationLink = (
      <Form action="/logout/" method="post">
        <button type="submit" className= "px-3 py-2 rounded hover:font-bold hover:italic hover:text-white text-slate-100">
          Logout
        </button>
      </Form>
    );
  } else if (location.pathname === '/signup/') {
    navigationLink = (
      <Link className="hover:font-bold hover:italic hover:text-white text-slate-100" to="/login/" >Login</Link>
    );
  } else if (location.pathname === '/login/') {
    navigationLink = (
      <Link className="hover:font-bold hover:italic hover:text-white text-slate-100" to="/signup/">Sign Up</Link>
    );
  } else {
    navigationLink = (
      <div className="flex space-x-4">
        <Link className="hover:font-bold hover:italic hover:text-white text-slate-100" to="/login/" >Login</Link>
        <Link className="hover:font-bold hover:italic hover:text-white text-slate-100" to="/signup/">Sign Up</Link>
      </div>
    );
  }

  return (
    <header className="sticky top-0 bg-green-800 shadow-md z-20">
      <nav className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-white text-lg font-semibold hover:text-blue-200 hover:font-bold">
          AFI Load Board
        </Link>
        <div >
          {navigationLink}
        </div>
      </nav>
    </header>
  );
}
