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
    borderRadius: '6px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)', // Increased shadow for depth
    margin: '2rem', // Increased margin for more space between boxes
    backgroundColor: '#ffffff',
    color: '#333',
    flexBasis: 'calc(33.333% - 2rem)', // Adjusted for three items per row considering the increased margin
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    transition: 'transform 0.3s ease',
    textDecoration: 'none',
    cursor: 'pointer',
    height: '100%', // Make sure all boxes are the same height
  };
  
  const mainBenefitHoverStyle = {
    ...mainBenefitStyle,
    transform: 'scale(1.05)', // Slightly enlarge the card on hover
  };

  // const additionalBenefitStyle = {
  //   ...mainBenefitStyle,
  //   flexBasis: 'calc(20% - 1rem)' // five items per row for additional benefits
  // };

  const headerStyle = {
    backgroundColor: '#004225', // Dark green
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    position: 'fixed', // This makes the header fixed at the top
    top: 0, // Aligns the header to the top of the viewport
    left: 0,
    right: 0, // These ensure the header spans the full width
    zIndex: 1000, // Ensures the header stays above other content
  };

  const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '10px 15px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  };
  // Function to handle mouse hover
  const handleMouseOver = (event) => {
    event.currentTarget.style.transform = mainBenefitHoverStyle.transform;
  };

  // Function to handle mouse leave
  const handleMouseLeave = (event) => {
    event.currentTarget.style.transform = 'none';
  };

  // Styles for primary action buttons, using orange background with white text
  const primaryActionStyle = {
    textDecoration: 'none',
    backgroundColor: '#ffa500', // Bright orange for CTA
    color: 'white', // White text for readability
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
  };
  
   // Assuming secondary action links should be blue with white background as discussed
  const secondaryActionStyle = {
    textDecoration: 'none', 
    color: '#0000EE', // High contrast link blue
    backgroundColor: 'white', // White background
    padding: '8px 16px', 
    borderRadius: '6px', 
    fontWeight: 'normal', // Less prominence than primary actions
    margin: '0 8px', // Space out the secondary actions
  };

  const footerStyle = {
    backgroundColor: '#fff',
    padding: '1rem',
    textAlign: 'center',
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  };

  const carrierBenefitSectionStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    // backgroundColor: '#e6f7ff', // Light blue background for carriers
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // subtle shadow for depth
  };
  
  const shipperBenefitSectionStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    // backgroundColor: '#e9ffd9', // Light green background for shippers
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // subtle shadow for depth
  };

  const sectionTitleStyle = {
    display: 'flex',
    justifyContent: 'center', // Center horizontally
    alignItems: 'center', // Center vertically
    textAlign: 'center',
    fontSize: '2rem', // Increase font size for prominence
    fontWeight: 'bold', // Make the font bold
    color: '#333', // Dark color for the text
    padding: '1rem', // Add some padding
    margin: '0 auto', // Center the title block
    width: '100%', // Ensure the title takes up the full width
    backgroundColor: '#f8f8f8', // A light background color
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Optional: subtle shadow
    borderRadius: '8px', // Optional: rounded corners for the background
  };
  
  
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.8', backgroundColor: '#f5f5f5', padding: '2rem' }}>
      <nav style={headerStyle}>
        <Link to="/" style={navLinkStyle}>AFI Load Board</Link>
        <div>
          <Link to="/features" style={navLinkStyle}>Features</Link>
          <Link to="/how-it-works" style={navLinkStyle}>How It Works</Link>
          <Link to="/pricing" style={navLinkStyle}>Pricing</Link>
          <Link to="/contact" style={navLinkStyle}>Contact</Link>
          <Link to="/sign-up" style={{ ...navLinkStyle, backgroundColor: '#ffa500', color: 'white', borderRadius: '5px' }}>Sign Up</Link>
        </div>
      </nav>
      <header style={{ backgroundColor: '#fff', padding: '2rem', textAlign: 'center', marginBottom: '2rem', marginTop: '2rem' }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem', color: '#333' }}>Welcome to the Load Board</h1>
        <p style={{ margin: '0 0 2rem 0', color: '#666' }}>Your One-Stop Solution for Freight Transportation</p>
        <Link to="/get-started" style={primaryActionStyle}>Get Started</Link>
      </header>

      <main style={{ backgroundColor: '#fff', padding: '2rem' }}>
        {/* Main benefits row */}
        <h2 style={sectionTitleStyle}>
          Wherever You Roll, We're Your Road: Partner with Us for Profitable Journeys  
        </h2>

        <div style={carrierBenefitSectionStyle}>
          <Link to="/find-loads" style={mainBenefitStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Unlock Your Earning Potential</h2>
            <p>Gain access to premium loads tailored to your route preferences and boost your profits with our smart match technology.</p>
            <p style={secondaryActionStyle}>Explore Opportunities</p>
          </Link>

          <Link to="/post-loads" style={mainBenefitStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Effortless Load Listing</h2>
            <p>Connect with top carriers instantly. Listing is simple, fast, and effective, ensuring your loads are moved without delay.</p>
            <p style={secondaryActionStyle}>List Your Loads Now</p>
          </Link>

          <Link to="/real-time-bidding" style={mainBenefitStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Competitive Bidding Platform</h2>
            <p>Enter the bidding arena and secure the best rates. Our real-time platform puts you in control of pricing.</p>
            <p style={secondaryActionStyle}>Engage Bidders</p>
          </Link>
        </div>

        {/* Additional benefits for shipper*/}
        <h2 style={sectionTitleStyle}>
           From Local Startups to Global Giants: Your Cargo, Delivered with Precision and Care
        </h2>
        <div style={shipperBenefitSectionStyle}>
          <Link to="/view-bids" style={mainBenefitStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Carrier Connections at a Click</h2>
            <p>Find dependable carriers instantly. Our streamlined system brings you a network of professionals with just one click.</p>
            <p style={secondaryActionStyle}>View Carrier Bids</p>
          </Link>

          <Link to="/post-loads" style={mainBenefitStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Seamless Load Posting</h2>
            <p>Get your loads on the road with ease. Our intuitive interface simplifies the posting process to save you time and hassle.</p>
            <p style={secondaryActionStyle}>Post Loads Effortlessly</p>
          </Link>

          <Link to="/manage-loads" style={mainBenefitStyle} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Streamline Your Operations</h2>
            <p>Take charge of your load management with our comprehensive dashboard. Organize, track, and update your shipments on the fly.</p>
            <p style={secondaryActionStyle}>Manage Loads Smartly</p>
          </Link>
        </div>

        {/* Additional benefits row */}
        {/* <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
      </div> */}

      </main>
      <footer style={footerStyle}>
        <p>© 2023 AfroInnovate LoadBoard. All rights reserved.</p>
      </footer>
    </div>
    
  );
}