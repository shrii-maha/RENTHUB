import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Search, SlidersHorizontal, ArrowRight, PackageOpen } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

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

  // Live Search with Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {};
      if (q) params.q = q;
      if (category && category !== 'All') params.category = category;
      setSearchParams(params);
    }, 400);

    return () => clearTimeout(timer);
  }, [q, category, setSearchParams]);

  useEffect(() => {
    fetchItems();
  }, [searchParams]);

  const handleClearFilters = () => {
    setQ('');
    setCategory('All');
    setSearchParams({});
  };

  return (
    <div className="fade-in max-w-7xl mx-auto px-4 py-8">
      {/* ── Page Header ── */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Explore the <span className="text-primary italic">Catalog</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Premium rentals at your fingertips. Find high-end tech, vehicles, and tools instantly.
        </p>
      </div>

      {/* ── Hero Search Area ── */}
      <div className="relative max-w-3xl mx-auto mb-16">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2">
            <div className="flex-grow relative border-r border-slate-100 pr-2">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="What are you looking for?"
                className="form-control"
                style={{ 
                  border: 'none', 
                  boxShadow: 'none', 
                  paddingLeft: '3.5rem', 
                  height: '56px', 
                  fontSize: '1.125rem',
                  marginBottom: 0
                }}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button className="hidden md:flex btn btn-primary px-8 h-12 rounded-xl items-center gap-2 transform active:scale-95 transition-transform">
              Find Items
            </button>
            <button className="md:hidden btn btn-primary p-3 rounded-xl ml-2">
               <Search size={22} />
            </button>
          </div>
        </div>

        {/* Category Bubbles */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {['All', 'Electronics', 'Vehicles', 'Tools', 'Party', 'Other'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                category.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary text-white shadow-lg shadow-indigo-100'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results Section ── */}
      <div className="w-full">
        {error && (
          <div className="max-w-md mx-auto card bg-rose-50 border-rose-100 text-rose-600 mb-12 p-5 flex items-center justify-between shadow-sm">
            <span className="font-medium">{error}</span>
            <button onClick={fetchItems} className="btn btn-danger py-2 px-4 text-xs font-bold uppercase tracking-wider">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="card h-[420px] bg-slate-50 border-none animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100 max-w-2xl mx-auto shadow-sm">
            <div className="text-slate-200 mb-6 flex justify-center transform scale-125">
               <PackageOpen size={96} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Nothing found here</h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">We couldn't find any items matching your current filters.</p>
            <button onClick={handleClearFilters} className="btn btn-primary px-10 py-3 rounded-xl">Clear and Reset</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {items.map(item => (
              <div 
                key={item._id} 
                className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] hover:-translate-y-2"
              >
                {/* Image Container */}
                <Link to={`/item/${item._id}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-50">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                  <div className="w-full h-full p-4 flex items-center justify-center">
                    {item.imageFilename ? (
                      <img
                        src={getImageUrl(item.imageFilename)}
                        alt={item.name}
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="text-slate-300 font-bold text-xs tracking-widest uppercase">No Preview</div>
                    )}
                  </div>
                  {/* Category Tag */}
                  <span className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">
                    {item.category}
                  </span>
                </Link>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors duration-300">
                      <Link to={`/item/${item._id}`}>{item.name}</Link>
                    </h3>
                  </div>
                  
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed h-10">
                    {item.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-5">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Rental Daily</p>
                        <p className="text-2xl font-black text-slate-900">₹{item.rentalPrice.toLocaleString('en-IN')}</p>
                    </div>
                    <Link 
                      to={`/item/${item._id}`} 
                      className="bg-slate-900 text-white p-3 rounded-xl hover:bg-primary transition-all duration-300 shadow-xl shadow-slate-200 group-hover:shadow-primary/20"
                    >
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;
