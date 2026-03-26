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

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {['All', 'Electronics', 'Vehicles', 'Tools', 'Party', 'Other'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95 ${
              category.toLowerCase() === cat.toLowerCase() 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100 hover:border-slate-300'
            }`}
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
