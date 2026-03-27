import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ItemCard from '../components/ItemCard';
import { Search, Filter } from 'lucide-react';

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (category && category !== 'All') params.append('category', category.toLowerCase());
      
      const res = await api.get(`/items?${params.toString()}`);
      setItems(res.data.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Connection failed. Please check your internet or refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchParams]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = {};
    if (q) params.q = q;
    if (category && category !== 'All') params.category = category;
    setSearchParams(params);
  };

  return (
    <div className="fade-in py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-10 text-slate-800">Browse Items</h1>

        {/* Horizontal Filter Bar - Matching Screenshot */}
        <div className="filter-bar">
          <div className="filter-section flex-grow">
            <Search size={22} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              className="filter-input"
              placeholder="Search items by name..." 
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="filter-section">
            <Filter size={22} className="text-slate-400 mr-2" />
            <select 
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Tools">Tools</option>
              <option value="Party">Party</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button 
            onClick={handleSearch} 
            className="btn btn-primary px-12 py-4 w-full md:w-auto"
            style={{ borderRadius: '15px' }}
          >
            Search
          </button>
        </div>

        {/* Results Content */}
        {error && (
          <div className="card text-center py-12 mb-8 border-rose-100 bg-rose-50">
            <p className="text-danger font-bold mb-4">{error}</p>
            <button onClick={fetchItems} className="btn btn-primary">Try Again</button>
          </div>
        )}

        {loading ? (
          <div className="item-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="item-card h-96 animate-pulse bg-slate-100"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card text-center py-20 flex flex-col items-center">
            <div className="bg-slate-50 p-6 rounded-full mb-6 text-slate-200">
              <Search size={64} />
            </div>
            <h2 className="text-2xl font-bold mb-2">No items found</h2>
            <p className="text-muted mb-8">Try adjusting your filters or search keywords.</p>
            <button onClick={() => { setQ(''); setCategory('All'); setSearchParams({}); }} className="btn btn-outline">Clear All Filters</button>
          </div>
        ) : (
          <div className="item-grid">
            {items.map(item => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;
