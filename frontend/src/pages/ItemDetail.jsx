import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Star, ShieldCheck, User, Package, ChevronLeft, Calendar, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rentalDays, setRentalDays] = useState(1);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  
  const [rentalError, setRentalError] = useState('');
  const [renting, setRenting] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleRent = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setRentalError('');
    setRenting(true);
    
    try {
      await api.post('/rentals', { itemId: id, days: rentalDays });
      navigate('/my-rentals');
    } catch (err) {
      setRentalError(err.response?.data?.error || 'Error requesting rental');
      setRenting(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setReviewing(true);
    
    try {
      await api.post(`/reviews/${id}`, { rating: Number(reviewRating), comment: reviewComment });
      const res = await api.get(`/items/${id}`);
      setData(res.data.data);
      setReviewComment('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error submitting review');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 animate-pulse">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-slate-400 font-medium">Loading details...</p>
    </div>
  );

  if (!data || !data.item) return (
    <div className="text-center py-24">
      <AlertCircle size={64} className="mx-auto text-slate-200 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800">Item not found</h2>
      <Link to="/items" className="btn btn-primary mt-6">Back to Catalog</Link>
    </div>
  );

  const { item, relatedItems } = data;
  const isOwner = user && item.owner && user.id === item.owner._id;

  return (
    <div className="fade-in max-w-7xl mx-auto px-4 py-8">
      {/* ── Breadcrumb ── */}
      <nav className="mb-8">
        <Link to="/items" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium">
          <ChevronLeft size={18} /> Back to Catalog
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* ── Left Col: Hero Image & Main Content (2/3) ── */}
        <div className="lg:w-2/3 space-y-10">
          
          {/* Image Showcase */}
          <div className="relative bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="aspect-[16/10] md:aspect-[16/9] bg-[#f8faff] p-8 flex items-center justify-center">
              {item.imageFilename ? (
                <img
                  src={getImageUrl(item.imageFilename)}
                  alt={item.name}
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-300">
                   <Package size={80} strokeWidth={1} />
                   <span className="text-sm font-bold uppercase tracking-widest">No Image Available</span>
                </div>
              )}
            </div>
            {/* Overlay Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-3">
               <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg text-primary text-xs font-black uppercase tracking-widest border border-white">
                 {item.category}
               </span>
               {item.isAvailable ? (
                 <span className="bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <CheckCircle2 size={12} /> Available
                 </span>
               ) : (
                 <span className="bg-rose-500 text-white px-4 py-2 rounded-xl shadow-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <AlertCircle size={12} /> Currently Rented
                 </span>
               )}
            </div>
          </div>

          {/* Description & Details */}
          <div className="space-y-8 px-2">
            <div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">{item.name}</h1>
               <div className="flex flex-wrap items-center gap-6 text-slate-500 mb-8 border-b border-slate-100 pb-8">
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <User size={18} className="text-primary" />
                    <span className="text-sm font-semibold text-slate-700">{item.owner?.fullName || 'Anonymous'}</span>
                  </div>
                  {item.owner?.isVerified && (
                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                       <ShieldCheck size={18} className="text-emerald-500" />
                       <span className="text-sm font-bold text-emerald-700">Verified Partner</span>
                    </div>
                  )}
               </div>
               
               <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                 <Info size={22} className="text-primary" /> Product Overview
               </h3>
               <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-medium pb-10">
                 {item.description}
               </p>
            </div>

            {/* Reviews Section */}
            <div className="pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between mb-10">
                 <h2 className="text-3xl font-black text-slate-900">User <span className="text-primary">Reviews</span></h2>
                 <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl">
                    <Star size={20} fill="#f59e0b" color="#f59e0b" />
                    <span className="font-black text-lg text-slate-800">
                      {item.reviews?.length > 0 ? (item.reviews.reduce((acc, r) => acc + r.rating, 0) / item.reviews.length).toFixed(1) : '0.0'}
                    </span>
                    <span className="text-slate-400 font-bold">/ 5.0</span>
                 </div>
              </div>

              {item.reviews && item.reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {item.reviews.map(rev => (
                    <div key={rev._id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-primary font-bold">
                             {rev.user?.fullName?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 m-0">{rev.user?.fullName || 'Guest'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 text-amber-400 bg-amber-50 px-2 py-1 rounded-lg">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < rev.rating ? 'currentColor' : 'none'} color={i < rev.rating ? 'currentColor' : '#cbd5e1'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed m-0">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <Star size={48} className="mx-auto text-slate-200 mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Be the first to leave a review</p>
                </div>
              )}

              {/* Leave Review Form */}
              {!isOwner && user && (
                <div className="mt-12 bg-white border-2 border-primary/10 p-8 rounded-3xl shadow-2xl shadow-primary/5">
                  <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Star size={24} className="text-primary" /> Write your feedback
                  </h3>
                  <form onSubmit={handleReview}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      <div className="md:col-span-1">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Rating SCORE</label>
                        <select className="form-control" style={{ height: '54px' }} value={reviewRating} onChange={e=>setReviewRating(e.target.value)} required>
                          <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                          <option value="4">⭐⭐⭐⭐ (4)</option>
                          <option value="3">⭐⭐⭐ (3)</option>
                          <option value="2">⭐⭐ (2)</option>
                          <option value="1">⭐ (1)</option>
                        </select>
                      </div>
                      <div className="md:col-span-3 text-sm">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Your Experince</label>
                        <textarea 
                          className="form-control" 
                          placeholder="How was the product? Was it as described?"
                          style={{ minHeight: '54px', paddingTop: '1rem' }}
                          value={reviewComment} 
                          onChange={e=>setReviewComment(e.target.value)} 
                          required
                        ></textarea>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 transform active:scale-95 transition-all" disabled={reviewing}>
                      {reviewing ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Col: Checkout Sidebar (1/3) ── */}
        <div className="lg:w-1/3">
          <div className="sticky top-24 bg-white border border-slate-100 p-8 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]">
             <div className="mb-10 text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Daily Rate</p>
                <div className="flex items-center justify-center gap-1">
                   <span className="text-5xl font-black text-slate-900">₹{item.rentalPrice.toLocaleString('en-IN')}</span>
                   <span className="text-xl text-slate-400 font-bold">/day</span>
                </div>
             </div>

             {isOwner ? (
                <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-2xl text-center">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Package size={32} className="text-primary" />
                   </div>
                   <h4 className="text-slate-900 font-black text-xl mb-2">Your Product</h4>
                   <p className="text-slate-500 text-sm mb-6 leading-relaxed">You listed this item. Manage bookings from your dashboard.</p>
                   <Link to="/dashboard" className="btn btn-primary btn-block py-4 rounded-xl shadow-lg shadow-primary/20">Go to Dashboard</Link>
                </div>
             ) : (
                <form onSubmit={handleRent} className="space-y-8">
                  {rentalError && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold border border-rose-100">{rentalError}</div>}
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block text-center">Rental Duration</label>
                    <div className="flex items-center gap-6 justify-center">
                       <button 
                         type="button" 
                         onClick={() => setRentalDays(Math.max(1, rentalDays - 1))}
                         className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-800 hover:bg-slate-50 active:scale-90 transition-all"
                         disabled={!item.isAvailable}
                       >-</button>
                       <span className="text-4xl font-black text-slate-900 w-16 text-center">{rentalDays}</span>
                       <button 
                         type="button" 
                         onClick={() => setRentalDays(Math.min(30, rentalDays + 1))}
                         className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-800 hover:bg-slate-50 active:scale-90 transition-all"
                         disabled={!item.isAvailable}
                       >+</button>
                    </div>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                      <Calendar size={12} /> Limit up to 30 days
                    </p>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center px-2">
                        <span className="text-sm font-bold text-slate-500">Service Fee (₹{item.rentalPrice} x {rentalDays})</span>
                        <span className="text-sm font-black text-slate-800">₹{(item.rentalPrice * rentalDays).toLocaleString('en-IN')}</span>
                     </div>
                     <div className="flex justify-between items-center px-2">
                        <span className="text-sm font-bold text-slate-500">Security Deposit</span>
                        <span className="text-sm font-black text-amber-600">₹{(item.depositAmount || 0).toLocaleString('en-IN')}</span>
                     </div>
                     <div className="border-t border-slate-100 pt-6 px-2 flex justify-between items-center">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Estimated Total</span>
                           <span className="text-3xl font-black text-primary">₹{((item.rentalPrice * rentalDays) + (item.depositAmount || 0)).toLocaleString('en-IN')}</span>
                        </div>
                        <Info size={24} className="text-slate-200" />
                     </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-block text-xl py-5 rounded-[20px] shadow-2xl shadow-primary/30 transform active:scale-[0.98] transition-all disabled:grayscale disabled:opacity-50" 
                    disabled={!item.isAvailable || renting}
                  >
                    {renting ? 'Processing...' : item.isAvailable ? 'Reserve Now' : 'Currently Rented'}
                  </button>
                  <div className="flex flex-col items-center gap-4 pt-4">
                     <div className="flex items-center gap-6 justify-center grayscale opacity-50 contrast-125">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-5" />
                     </div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} /> 100% Secure Checkout
                     </p>
                  </div>
                </form>
             )}
          </div>
        </div>
      </div>

      {/* Related Items */}
      {relatedItems && relatedItems.length > 0 && (
        <section className="mt-24 pt-24 border-t border-slate-100 pb-20">
          <div className="flex justify-between items-end mb-12">
             <div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Recommended</p>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Similar <span className="text-slate-400">Products</span></h2>
             </div>
             <Link to="/items" className="text-sm font-black text-primary hover:underline flex items-center gap-2">
                All Items <ArrowRight size={16} />
             </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {relatedItems.map(item => (
                <div key={item._id} className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                  <Link to={`/item/${item._id}`} className="block relative aspect-square overflow-hidden bg-slate-50 p-6">
                    {item.imageFilename ? (
                      <img
                        src={getImageUrl(item.imageFilename)}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 uppercase text-[10px] font-bold">No Image</div>
                    )}
                  </Link>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 truncate group-hover:text-primary transition-colors">
                      <Link to={`/item/${item._id}`}>{item.name}</Link>
                    </h3>
                    <div className="flex justify-between items-center">
                       <span className="text-xl font-black text-slate-900">₹{item.rentalPrice.toLocaleString('en-IN')}</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.category}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Add explicit Arrows to the top
const ArrowRight = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
);

export default ItemDetail;
