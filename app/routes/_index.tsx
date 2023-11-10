import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [{
    title: 'LoadBoard APP',
    description: 'Welcome to AfroInnovate LoadBoard App'
  }];
};


export default function Index() {
  // Define CSS for the main benefit boxes and additional benefit boxes
  const mainBenefitStyle = {
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    margin: '0.5rem',
    backgroundColor: '#ffffff',
    color: '#333',
    flexBasis: 'calc(33.333% - 1rem)', // three items per row
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const additionalBenefitStyle = {
    ...mainBenefitStyle,
    flexBasis: 'calc(20% - 1rem)' // five items per row for additional benefits
  };

  const headerStyle = {
    backgroundColor: '#004225', // Dark green
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  };

  const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '10px 15px',
    fontSize: '1.5rem',
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.8', backgroundColor: '#f5f5f5', padding: '2rem' }}>
      <nav style={headerStyle}>
        <Link to="/" style={{ ...navLinkStyle, fontSize: '1.5rem', fontWeight: 'bold' }}>AFI Load Board</Link>
        <div>
          <Link to="/features" style={navLinkStyle}>Features</Link>
          <Link to="/how-it-works" style={navLinkStyle}>How It Works</Link>
          <Link to="/pricing" style={navLinkStyle}>Pricing</Link>
          <Link to="/contact" style={navLinkStyle}>Contact</Link>
          <Link to="/sign-up" style={{ ...navLinkStyle, backgroundColor: '#ffa500', color: 'white', borderRadius: '5px' }}>Sign Up</Link>
        </div>
      </nav>
      <header style={{ backgroundColor: '#fff', padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem', color: '#333' }}>Welcome to the Load Board</h1>
        <p style={{ margin: '0 0 2rem 0', color: '#666' }}>Your One-Stop Solution for Freight Transportation</p>
        <Link to="/get-started" style={{ textDecoration: 'none', backgroundColor: '#ffa500', color: 'white', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold' }}>Get Started</Link>
      </header>

     {/* Main benefits row */}
     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={mainBenefitStyle}>
          <h2>Maximize Earnings</h2>
          <p>Discover loads that match your route and maximize your earnings with our advanced matching system.</p>
          <Link to="/find-loads" style={{ color: '#007bff', textDecoration: 'none' }}>Find Loads</Link>
        </div>

        <div style={mainBenefitStyle}>
          <h2>List with Ease</h2>
          <p>Post your available loads and find reliable carriers quickly and easily.</p>
          <Link to="/post-loads" style={{ color: '#007bff', textDecoration: 'none' }}>Post Loads</Link>
        </div>

        <div style={mainBenefitStyle}>
          <h2>Bid in Real-Time</h2>
          <p>Engage in real-time bidding to secure the best rates for your loads.</p>
          <Link to="/real-time-bidding" style={{ color: '#007bff', textDecoration: 'none' }}>Start Bidding</Link>
        </div>
      </div>

      {/* Additional benefits row */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={additionalBenefitStyle}><p>Efficiency</p></div>
        <div style={additionalBenefitStyle}><p>Effectiveness</p></div>
        <div style={additionalBenefitStyle}><p>Security</p></div>
        <div style={additionalBenefitStyle}><p>Traceability</p></div>
        <div style={additionalBenefitStyle}><p>Transparency</p></div>
        <div style={additionalBenefitStyle}><p>Reliability</p></div>
        <div style={additionalBenefitStyle}><p>Cost Savings</p></div>
        <div style={additionalBenefitStyle}><p>In-App Communication</p></div>
        <div style={additionalBenefitStyle}><p>Data-Driven Insights</p></div>
        <div style={additionalBenefitStyle}><p>User-Friendly Experience</p></div>
      </div>

      <footer style={{ backgroundColor: '#fff', padding: '1rem', textAlign: 'center', marginTop: '2rem' }}>
        <p>© 2023 AfroInnovate LoadBoard. All rights reserved.</p>
      </footer>
    </div>
  );
}