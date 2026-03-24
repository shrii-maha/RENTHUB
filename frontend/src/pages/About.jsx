import { Package } from 'lucide-react';

const About = () => {
  return (
    <div className="fade-in max-w-4xl py-8">
      <div className="text-center mb-12">
        <Package size={48} className="text-primary mx-auto mb-4" />
        <h1>About RentHub</h1>
        <p className="text-xl text-muted">The peer-to-peer rental marketplace.</p>
      </div>

      <div className="card mb-8">
        <h2>Our Mission</h2>
        <p className="text-muted text-lg mb-4">
          Provide a secure, seamless platform for individuals to rent and list items. 
          By participating in the sharing economy, we help reduce waste, save money, and build stronger communities.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-12">
        <div className="glass-panel text-center">
          <h3 className="text-primary mb-2 border-b pb-2">Why Rent?</h3>
          <p className="text-muted m-0">Need a tool for a one-time project? A camera for a weekend trip? Don't buy it, rent it locally for a fraction of the cost.</p>
        </div>
        <div className="glass-panel text-center">
          <h3 className="text-secondary mb-2 border-b pb-2">Why List?</h3>
          <p className="text-muted m-0">Turn your unused items into passive income. List securely, approve renters, and get paid automatically via Stripe.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
