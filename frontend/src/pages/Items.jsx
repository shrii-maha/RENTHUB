import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Search, Filter } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = '/items?';
      if (q) url += `q=${q}&`;
      if (category && category !== 'All') url += `category=${category}`;
      
      const res = await api.get(url);
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (q) params.q = q;
    if (category) params.category = category;
    setSearchParams(params);
  };

  return (
    <div className="fade-in py-4">
      <div className="flex justify-between items-center mb-6">
        <h1>Browse Items</h1>
      </div>

      <div className="mb-12 w-full max-w-4xl mx-auto mt-4">
        <form onSubmit={handleSearch}>
          <div 
            className="p-[2px] rounded-full shadow-xl shadow-indigo-500/20"
            style={{ backgroundImage: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)' }}
          >
            <div className="flex items-center bg-[#0B1121] rounded-full p-1.5 w-full">
              <button 
                type="submit" 
                className="bg-indigo-500 hover:bg-indigo-400 transition-colors rounded-full p-3.5 flex items-center justify-center flex-shrink-0"
                style={{ width: '48px', height: '48px' }}
              >
                <Search className="text-white" size={24} />
              </button>
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-white text-lg px-5 flex-grow font-light tracking-wider placeholder:text-slate-400"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="pr-4 pl-2 border-l border-slate-700 hidden sm:block">
                <select 
                  className="bg-transparent border-none outline-none text-slate-300 text-sm cursor-pointer hover:text-white transition-colors uppercase tracking-wider font-medium"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="All" className="bg-slate-800 text-white">All Categories</option>
                  <option value="electronics" className="bg-slate-800 text-white">Electronics</option>
                  <option value="vehicles" className="bg-slate-800 text-white">Vehicles</option>
                  <option value="tools" className="bg-slate-800 text-white">Tools</option>
                  <option value="party" className="bg-slate-800 text-white">Party Supplies</option>
                  <option value="other" className="bg-slate-800 text-white">Other</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-muted">No items found matching your criteria.</h3>
          <button onClick={() => { setQ(''); setCategory('All'); setSearchParams({}); }} className="btn btn-outline mt-4">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item._id} className="card p-0 overflow-hidden flex flex-col">
              <Link to={`/item/${item._id}`} style={{ display: 'block' }}>
                <div style={{ height: '180px', backgroundColor: '#e2e8f0', backgroundImage: `url("${getImageUrl(item.imageFilename)}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {!item.imageFilename && <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>}
                </div>
              </Link>
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }} className="line-clamp-1"><Link to={`/item/${item._id}`} style={{ color: 'var(--text-main)' }}>{item.name}</Link></h3>
                </div>
                <div className="mb-2">
                  <span className="badge badge-info uppercase" style={{ fontSize: '0.7rem' }}>{item.category}</span>
                </div>
                <p className="text-muted text-sm mb-4 line-clamp-2">{item.description}</p>
                <div className="mt-auto flex justify-between items-center pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                  <span className="font-bold text-lg">₹{item.rentalPrice}<span className="text-muted text-sm font-normal">/day</span></span>
                  <Link to={`/item/${item._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Rent</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Items;
