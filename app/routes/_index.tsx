import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { Link } from 'react-router-dom';
import styles from '../styles/global.css';

export const links: LinksFunction = () => [
  ...(styles ? [{ rel: "stylesheet", href: styles }] : []),
];

export const meta: MetaFunction = () => {
  return [{
    title: 'Loadboard | Home',
    description: 'Welcome to AfroInnovate LoadBoard App'
  }];
};

export default function Index() {
  return (
    <div className="font-serif">
        {/* ... rest of your nav component ... */}
      <header className="page-header">
        <h1 className="title">Welcome to the Load Board</h1>
        <p className="description">Your One-Stop Solution for Freight Transportation</p>
        <Link to="/login/" className="primary-action hover:bg-blue-700">Get Started</Link>
      </header>

      <body className='main-section'>
        {/* Main benefits row */}
        <h2 className='section-title'>
          {/* Wherever You Roll, We're Your Road: Partner with Us for Profitable Journeys   */}
          Shipper's Benefits
        </h2>

        <div className='benefit-section'>
          <Link to="/login/" className='main-benefit' >
            <h2>Unlock Your Earning Potential</h2>
            <p>Gain access to premium loads tailored to your route preferences and boost your profits with our smart match technology.</p>
            <p className='secondary-action'>Explore Opportunities</p>
          </Link>

          <Link to="/login/" className='main-benefit' >
            <h2>Effortless Load Listing</h2>
            <p>Connect with top carriers instantly. Listing is simple, fast, and effective, ensuring your loads are moved without delay.</p>
            <p className='secondary-action'>List Your Loads Now</p>
          </Link>

          <Link to="/login/" className='main-benefit' >
            <h2>Competitive Bidding Platform</h2>
            <p>Enter the bidding arena and secure the best rates. Our real-time platform puts you in control of pricing.</p>
            <p className='secondary-action'>Engage Bidders</p>
          </Link>
        </div>

        {/* Additional benefits for shipper*/}
        <h2 className='section-title'>
          {/* Local Startups to Global Giants: Your Cargo, Delivered with Precision and Care */}
          Carrier's Benefits
        </h2>
        <div className='benefit-section'>
          <Link to="/login/" className='main-benefit' >
            <h2>Carrier Connections at a Click</h2>
            <p>Find dependable carriers instantly. Our streamlined system brings you a network of professionals with just one click.</p>
            <p className='secondary-action'>View Carrier Bids</p>
          </Link>

          <Link to="/login/" className='main-benefit' >
            <h2>Seamless Load Posting</h2>
            <p>Get your loads on the road with ease. Our intuitive interface simplifies the posting process to save you time and hassle.</p>
            <p className='secondary-action'>Post Loads Effortlessly</p>
          </Link>

          <Link to="/login/" className='main-benefit' >
            <h2>Streamline Your Operations</h2>
            <p>Take charge of your load management with our comprehensive dashboard. Organize, track, and update your shipments on the fly.</p>
            <p className='secondary-action'>Manage Loads Smartly</p>
          </Link>
        </div>
      </body>
    </div>
  );
}