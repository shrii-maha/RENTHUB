import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Clock, CreditCard, ArrowRight, Star, Zap, Globe, Package } from 'lucide-react';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageUtils';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch latest items
    api.get('/items')
      .then(res => {
        setFeaturedItems(res.data.data.slice(0, 8));
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
    <div className="fade-in overflow-hidden -mt-4">
      {/* ── Hero Section (Premium Gradient) ── */}
      <section className="relative pt-24 pb-32 flex flex-col items-center overflow-hidden">
        {/* Abstract Background Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-1.5 rounded-full mb-8 transform hover:scale-105 transition-transform duration-500">
             <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">New</span>
             <span className="text-primary text-xs font-bold">Premium Rental Experience is Live</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
            Rent <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600 italic">Anything</span>.<br />
            List <span className="text-slate-400">Everything</span>.
          </h1>
          
          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            The platform for elite rentals. Rent high-end tech, vehicles, and premium tools from trusted owners in your city.
          </p>
          
          {/* Main Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group mb-12 p-3 bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 flex items-center gap-2">
            <div className="flex-grow flex items-center pl-4 border-r border-slate-100">
               <Search size={22} className="text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search for MacBook, Tesla, Camera..." 
                 className="form-control"
                 style={{ border: 'none', boxShadow: 'none', fontSize: '1.125rem', height: '60px', marginBottom: 0 }}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <button type="submit" className="btn btn-primary px-10 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transform active:scale-95 transition-all">
               Explore
            </button>
          </form>

          <div className="flex flex-wrap justify-center items-center gap-10 text-slate-400 mt-4 opacity-70">
             <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                <Shield size={16} className="text-primary" /> Verified Safety
             </div>
             <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                <Globe size={16} className="text-indigo-500" /> Pan-India Network
             </div>
             <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                <Zap size={16} className="text-amber-500" /> Instant Approvals
             </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards (Modern Minimalist) ── */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 -mt-16">
        <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/50 shadow-xl group hover:bg-white transition-all duration-500">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
             <Shield size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-4">Secure Transactions</h3>
          <p className="text-slate-500 leading-relaxed font-medium">Verify your identity once and enjoy encrypted payments through Stripe & Razorpay.</p>
        </div>
        <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/50 shadow-xl group hover:bg-white transition-all duration-500">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform">
             <Clock size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-4">Rapid Approvals</h3>
          <p className="text-slate-500 leading-relaxed font-medium">Our owner network responds in minutes. No more waiting days for confirmation.</p>
        </div>
        <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/50 shadow-xl group hover:bg-white transition-all duration-500">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 transition-transform">
             <CreditCard size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-4">Earn Passive Income</h3>
          <p className="text-slate-500 leading-relaxed font-medium">Have gear sitting around? Turn your idle assets into a steady revenue stream effortlessly.</p>
        </div>
      </section>

      {/* ── Featured Items Section (Premium UI) ── */}
      <section className="bg-slate-50 py-32 rounded-[64px] border border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 px-4">
            <div>
              <p className="text-sm font-black text-primary uppercase tracking-widest mb-4">Latest Arrivals</p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Featured <span className="text-slate-400">Catalog</span></h2>
            </div>
            <Link to="/items" className="flex items-center gap-2 text-primary font-black group mt-6 md:mt-0">
               Check Full Inventory <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="card h-96 bg-slate-100 border-none animate-pulse rounded-3xl"></div>
              ))
            ) : (
              featuredItems.map(item => (
                <div key={item._id} className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                  <Link to={`/item/${item._id}`} className="block relative aspect-square overflow-hidden bg-[#f8faff] p-8">
                    {item.imageFilename ? (
                      <img 
                        src={getImageUrl(item.imageFilename)} 
                        alt={item.name} 
                        className="w-full h-full object-contain filter drop-shadow-xl group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                         <Package size={48} strokeWidth={1} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                    {/* Floating Price Tag */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white">
                       <span className="text-primary font-black text-sm">₹{item.rentalPrice}</span>
                       <span className="text-slate-400 text-[10px] font-bold">/d</span>
                    </div>
                  </Link>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.category}</span>
                       <div className="flex items-center gap-1">
                          <Star size={10} fill="#f59e0b" color="#f59e0b" />
                          <span className="text-[10px] font-bold text-slate-800">4.9</span>
                       </div>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-3 truncate group-hover:text-primary transition-colors">
                      <Link to={`/item/${item._id}`}>{item.name}</Link>
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-1 leading-relaxed font-medium">{item.description}</p>
                    <div className="mt-auto flex justify-between items-center pt-5 border-t border-slate-50">
                      <Link to={`/item/${item._id}`} className="text-xs font-black text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                         View Details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Call to Action (Gradient) ── */}
      <section className="max-w-7xl mx-auto px-4 py-32">
         <div className="relative bg-slate-900 rounded-[64px] overflow-hidden p-12 md:p-24 text-center">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
               <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to start <br /><span className="text-primary italic">earning</span>?</h2>
               <p className="text-slate-400 text-lg mb-12 leading-relaxed font-medium">Join 2,000+ owners who have already listed their gear on RentHub. It takes less than 2 minutes to create your first listing.</p>
               <div className="flex flex-col md:flex-row justify-center gap-6">
                  <Link to="/add-item" className="btn btn-primary px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl shadow-primary/40 transform hover:scale-105 active:scale-95 transition-all">List Your First Item</Link>
                  <Link to="/items" className="bg-white/10 text-white backdrop-blur-md px-12 py-5 rounded-2xl text-xl font-bold hover:bg-white/20 transition-all border border-white/10">Browse Marketplace</Link>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
