import { Link } from "@remix-run/react";

export default function CatchAllRoute() {
  return (
    <div className="error-container">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Go back to the homepage</Link>
    </div>
  );
}
