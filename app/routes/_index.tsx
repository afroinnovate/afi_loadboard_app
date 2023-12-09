import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { Link, Outlet } from '@remix-run/react';

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
    <div className="font-sans leading-10 bg-gray-100 p-8">
      <nav className="header">
        <Link to="/" className="nav-link">AFI Load Board</Link>
        <div>
          <Link to="/features" className="nav-link">Features</Link>
          <Link to="/how-it-works" className="nav-link">How It Works</Link>
          <Link to="/pricing" className="nav-link">Pricing</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/signup" className="nav-link sign-up-button">Sign Up</Link>
        </div>
      </nav>
        {/* ... rest of your nav component ... */}
      <header className="page-header">
        <h1 className="title">Welcome to the Load Board</h1>
        <p className="description">Your One-Stop Solution for Freight Transportation</p>
        <Link to="/get-started" className="primary-action">Get Started</Link>
      </header>

      <body className='main-section'>
        {/* Main benefits row */}
        <h2 className='section-title'>
          Wherever You Roll, We're Your Road: Partner with Us for Profitable Journeys  
        </h2>

        <div className='benefit-section'>
          <Link to="/find-loads" className='main-benefit' onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Unlock Your Earning Potential</h2>
            <p>Gain access to premium loads tailored to your route preferences and boost your profits with our smart match technology.</p>
            <p className='secondary-action'>Explore Opportunities</p>
          </Link>

          <Link to="/post-loads" className='main-benefit' onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Effortless Load Listing</h2>
            <p>Connect with top carriers instantly. Listing is simple, fast, and effective, ensuring your loads are moved without delay.</p>
            <p className='secondary-action'>List Your Loads Now</p>
          </Link>

          <Link to="/real-time-bidding" className='main-benefit' onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Competitive Bidding Platform</h2>
            <p>Enter the bidding arena and secure the best rates. Our real-time platform puts you in control of pricing.</p>
            <p className='secondary-action'>Engage Bidders</p>
          </Link>
        </div>

        {/* Additional benefits for shipper*/}
        <h2 className='section-title'>
           From Local Startups to Global Giants: Your Cargo, Delivered with Precision and Care
        </h2>
        <div style={shipperBenefitSectionStyle}>
          <Link to="/view-bids" className='main-benefit' onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Carrier Connections at a Click</h2>
            <p>Find dependable carriers instantly. Our streamlined system brings you a network of professionals with just one click.</p>
            <p className='secondary-action'>View Carrier Bids</p>
          </Link>

          <Link to="/post-loads" className='main-benefit' onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Seamless Load Posting</h2>
            <p>Get your loads on the road with ease. Our intuitive interface simplifies the posting process to save you time and hassle.</p>
            <p className='secondary-action'>Post Loads Effortlessly</p>
          </Link>

          <Link to="/manage-loads" className='main-benefit' onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
            <h2>Streamline Your Operations</h2>
            <p>Take charge of your load management with our comprehensive dashboard. Organize, track, and update your shipments on the fly.</p>
            <p className='secondary-action'>Manage Loads Smartly</p>
          </Link>
        </div>
      </body>
      <footer className="footer">
        <p>© 2023 AfroInnovate LoadBoard. All rights reserved.</p>
      </footer>
    </div>
  );
}