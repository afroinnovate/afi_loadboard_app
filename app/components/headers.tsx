// app/components/Header.tsx
import { Form, Link, useLocation } from "@remix-run/react";

export default function Header({ user }) {
  const location = useLocation();

  let navigationLink;

  // Determine the navigation link based on the user's authentication status and current location
  if (user || location.pathname.startsWith('/dashboard')) {
    navigationLink = (
      <Form action="/logout" method="post">
        <button type="submit" className= "px-3 py-2 rounded">
          Logout
        </button>
      </Form>
    );
  } else if (location.pathname === '/signup') {
    navigationLink = (
      <Link to="/login" >Login</Link>
    );
  } else if (location.pathname === '/login') {
    navigationLink = (
      <Link to="/signup">Sign Up</Link>
    );
  } else {
    navigationLink = (
      <Link to="/signup">Sign Up</Link>
    );
  }

  return (
    <header className="bg-white shadow-md">
    <nav className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
      <Link to="/" className="text-blue-600 text-lg font-semibold hover:text-blue-200">
        AFI Load Board
      </Link>
      <div className="text-black hover:font-bold hover:italic hover:text-blue-700">
        {navigationLink}
      </div>
    </nav>
  </header>
  
  );
}
