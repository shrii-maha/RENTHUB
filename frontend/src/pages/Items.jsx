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
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/items?';
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (category && category !== 'All') params.append('category', category.toLowerCase());
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort) params.append('sort', sort);
      
      const res = await api.get(`${url}${params.toString()}`);
      setItems(res.data.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Connection failed. Please check your internet or refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault(); // Prevents page reload
  };

  // Live Search with Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {};
      if (q) params.q = q;
      if (category && category !== 'All') params.category = category;
      if (sort && sort !== 'newest') params.sort = sort;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      setSearchParams(params);
    }, 400);

    return () => clearTimeout(timer);
  }, [q, category, sort, minPrice, maxPrice]);

  useEffect(() => {
    fetchItems();
  }, [searchParams]);

  const handleClearFilters = () => {
    setQ('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="fade-in py-4">
      <div className="flex justify-between items-center mb-6">
        <h1>Browse Items</h1>
      </div>

      {/* ── Search Bar ── */}
      <div className="card mb-6" style={{ padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>

            {/* Search Input — takes all remaining space */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute', left: '0.9rem',
                  top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Search items by name..."
                className="form-control"
                style={{ paddingLeft: '2.5rem', height: '44px', borderRadius: '10px', marginBottom: 0 }}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            {/* Category Dropdown — fixed width */}
            <div style={{ width: '180px', flexShrink: 0, position: 'relative' }}>
              <Filter
                size={15}
                style={{
                  position: 'absolute', left: '0.9rem',
                  top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1
                }}
              />
              <select
                className="form-control"
                style={{
                  paddingLeft: '2.5rem', height: '44px',
                  borderRadius: '10px', appearance: 'none',
                  cursor: 'pointer', marginBottom: 0
                }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="vehicles">Vehicles</option>
                <option value="tools">Tools</option>
                <option value="party">Party Supplies</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ height: '44px', minWidth: '110px', borderRadius: '10px', flexShrink: 0 }}
            >
              <Search size={16} /> Search
            </button>
          </div>
        </form>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
        {['All', 'Electronics', 'Vehicles', 'Tools', 'Party', 'Other'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '0.4rem 1.2rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: category.toLowerCase() === cat.toLowerCase() ? 'none' : '1px solid rgba(0,0,0,0.1)',
              background: category.toLowerCase() === cat.toLowerCase() ? 'var(--primary)' : 'transparent',
              color: category.toLowerCase() === cat.toLowerCase() ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="card p-5">
            <h4 className="flex items-center gap-2 mb-4 font-bold text-slate-800">
              <Filter size={18} /> Filters
            </h4>
            
            <div className="space-y-4">
              {/* Sort By */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Sort By</label>
                <select 
                  className="form-control text-sm"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Price Range</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="form-control text-sm px-2"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-slate-400">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="form-control text-sm px-2"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={handleClearFilters}
                className="btn btn-outline btn-block text-xs py-2 mt-4"
              >
                Clear All
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-grow">
          {error && (
            <div className="card bg-rose-50 border-rose-100 text-rose-600 mb-6 p-4 flex items-center justify-between">
              <span className="font-medium">{error}</span>
              <button onClick={fetchItems} className="btn btn-danger py-1 px-3 text-xs">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="card h-80 bg-slate-100"></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="card text-center py-20 bg-slate-50 border-dashed border-2 border-slate-200">
              <div className="text-slate-300 mb-4 flex justify-center"><Search size={64} /></div>
              <h3 className="text-slate-800 font-bold">No results found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your filters or search terms.</p>
              <button onClick={handleClearFilters} className="btn btn-primary">Reset Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <div 
                  key={item._id} 
                  className="card p-0 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                  style={{ border: 'none', background: 'white', borderBottom: '4px solid transparent' }}
                >
                  <Link to={`/item/${item._id}`} style={{ display: 'block' }} className="relative overflow-hidden aspect-video">
                    <div 
                      className="w-full h-full transform transition-transform duration-700 group-hover:scale-110"
                      style={{ 
                        backgroundColor: '#f1f5f9', 
                        backgroundImage: `url("${getImageUrl(item.imageFilename)}")`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center',
                        height: '200px'
                      }}
                    >
                      {!item.imageFilename && <div className="w-full h-full flex items-center justify-center text-slate-300 uppercase text-xs font-bold">No Preview</div>}
                    </div>
                  </Link>
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{item.category}</span>
                       <span className="text-[10px] text-slate-400 font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                      <Link to={`/item/${item._id}`}>{item.name}</Link>
                    </h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">{item.description}</p>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-50">
                      <div>
                        <span className="text-xs text-slate-400 block mb-[-2px]">Per Day</span>
                        <span className="font-ex-bold text-xl text-slate-900">₹{item.rentalPrice}</span>
                      </div>
                      <Link to={`/item/${item._id}`} className="btn btn-primary rounded-lg py-2 px-6 shadow-indigo-200 shadow-lg group-hover:bg-indigo-700">Rent Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Items;
