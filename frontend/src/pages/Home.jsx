import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Clock, CreditCard, ArrowRight, Package } from 'lucide-react';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/items')
      .then(res => {
        setFeaturedItems(res.data.data.slice(0, 4));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/items?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="fade-in">
      {/* Hero Section - Matching Screenshot */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Rent Anything. List Everything.</h1>
          <p className="hero-subtitle">
            RentHub connects people who need things with people who have things.
            From tools to tech, rent locally and safely.
          </p>

          <div className="flex justify-center gap-4 mb-12">
            <Link to="/items" className="btn btn-primary px-10">Browse Items</Link>
            <Link to="/add-item" className="btn btn-outline px-10">List an Item</Link>
          </div>

          <div className="search-box-container">
            <form onSubmit={handleSearch} className="search-input-wrapper">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn-icon">
                <Search size={24} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section - Matching Screenshot */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Shield size={48} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Safe & Secure</h3>
              <p className="text-muted">Verified users and secure payments through Stripe.</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Clock size={48} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Quick Approvals</h3>
              <p className="text-muted">Owners review requests quickly. Get your item fast.</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-6">
                <CreditCard size={48} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Earn Money</h3>
              <p className="text-muted">List your unused items and generate passive income.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listing Section - Matching Screenshot */}
      <section className="py-20" style={{ backgroundColor: '#fcfdfe' }}>
        <div className="container">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-bold">Featured Listing</h2>
            <Link to="/items" className="text-primary font-bold flex items-center gap-2">
              View All <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="item-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="item-card h-80 animate-pulse bg-slate-100"></div>
              ))}
            </div>
          ) : (
            <div className="item-grid">
              {featuredItems.map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
