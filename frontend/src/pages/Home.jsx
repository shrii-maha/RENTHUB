import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Clock, CreditCard } from 'lucide-react';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageUtils';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);

  useEffect(() => {
    // Fetch latest items
    api.get('/items')
      .then(res => setFeaturedItems(res.data.data.slice(0, 6)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="text-center py-8 mb-8">
        <h1 className="text-3xl font-bold mb-4" style={{ fontSize: '3rem', color: 'var(--primary)' }}>Rent Anything. List Everything.</h1>
        <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
          RentHub connects people who need things with people who have things. From tools to tech, rent locally and safely.
        </p>
        
        <div className="flex justify-center gap-4 mb-8">
          <Link to="/items" className="btn btn-primary btn-lg px-8 py-3 text-lg">Browse Items</Link>
          <Link to="/add-item" className="btn btn-outline btn-lg px-8 py-3 text-lg">List an Item</Link>
        </div>

        {/* Quick Search */}
        <div className="max-w-2xl mx-auto glass-panel p-4 flex gap-2">
          <input 
            type="text" 
            placeholder="What are you looking for?" 
            className="form-control"
            style={{ marginBottom: 0 }}
          />
          <button className="btn btn-primary"><Search size={20} /></button>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-3 gap-6 mb-8 mt-8">
        <div className="card text-center">
          <div className="text-primary mb-4 flex justify-center"><Shield size={40} /></div>
          <h3>Safe & Secure</h3>
          <p className="text-muted">Verified users and secure payments through Stripe.</p>
        </div>
        <div className="card text-center">
          <div className="text-primary mb-4 flex justify-center"><Clock size={40} /></div>
          <h3>Quick Approvals</h3>
          <p className="text-muted">Owners review requests quickly. Get your item fast.</p>
        </div>
        <div className="card text-center">
          <div className="text-primary mb-4 flex justify-center"><CreditCard size={40} /></div>
          <h3>Earn Money</h3>
          <p className="text-muted">List your unused items and generate passive income.</p>
        </div>
      </section>

      {/* Featured Items */}
      <section className="mt-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2>Featured Items</h2>
          <Link to="/items" className="text-primary font-bold">View All &rarr;</Link>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {featuredItems.map(item => (
            <div key={item._id} className="card p-0 overflow-hidden flex flex-col">
              <div style={{ height: '200px', backgroundColor: '#e2e8f0' }}>
                {item.imageFilename ? (
                  <img src={getImageUrl(item.imageFilename)} alt={item.name} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
                )}
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{item.name}</h3>
                  <span className="badge badge-success">₹{item.rentalPrice}/day</span>
                </div>
                <p className="text-muted text-sm mb-4 line-clamp-2">{item.description}</p>
                <div className="mt-auto pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                  <Link to={`/item/${item._id}`} className="btn btn-outline btn-block">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
