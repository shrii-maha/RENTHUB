import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Star, ShieldCheck, User, Package, ChevronLeft, Calendar, Info, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
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

  if (loading) return <div className="py-24 text-center"><p className="text-muted">Loading product details...</p></div>;
  if (!data || !data.item) return (
    <div className="text-center py-24">
      <AlertCircle size={64} className="mx-auto text-slate-200 mb-4" />
      <h2 className="text-2xl font-bold">Item not found</h2>
      <Link to="/items" className="btn btn-primary mt-6">Back to Marketplace</Link>
    </div>
  );

  const { item, relatedItems } = data;
  const isOwner = user && item.owner && user.id === item.owner._id;

  return (
    <div className="fade-in py-8">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <Link to="/items" className="text-muted hover:text-primary transition-colors inline-flex items-center gap-2">
          <ChevronLeft size={16} /> Back to Marketplace
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Col: Showcase & Content */}
        <div className="lg:w-2/3">
          {/* Main Image Card */}
          <div className="card p-0 overflow-hidden mb-12 shadow-2xl">
             <div className="aspect-[16/10] bg-slate-50 flex items-center justify-center p-8 relative">
                {item.imageFilename ? (
                  <img
                    src={getImageUrl(item.imageFilename)}
                    alt={item.name}
                    className="w-full h-full object-contain filter drop-shadow-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-slate-200 uppercase tracking-widest font-black">
                     <Package size={64} strokeWidth={1} />
                     <span>No Image Gallery</span>
                  </div>
                )}
                
                {/* Floating Tag */}
                <span className={`absolute top-6 left-6 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${item.isAvailable ? 'bg-secondary' : 'bg-rose-500'}`}>
                  {item.isAvailable ? 'Available' : 'Rented Out'}
                </span>
             </div>
             
             <div className="p-8">
                <div className="flex flex-wrap gap-4 mb-8">
                   <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                      <User size={18} className="text-primary" />
                      <span className="text-sm font-bold text-slate-700">Owner: {item.owner?.fullName || 'Anonymous'}</span>
                   </div>
                   {item.owner?.isVerified && (
                     <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <ShieldCheck size={18} className="text-secondary" />
                        <span className="text-sm font-bold text-secondary-hover">Verified Marketplace Partner</span>
                     </div>
                   )}
                </div>

                <h1 className="text-4xl font-bold mb-6">{item.name}</h1>
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap mb-10">
                   {item.description}
                </p>

                {/* Reviews */}
                <div className="pt-12 border-t mt-12">
                   <div className="flex justify-between items-center mb-10">
                      <h2 className="text-2xl font-bold">Client Reviews</h2>
                      <div className="flex items-center gap-2">
                         <Star size={20} fill="#f59e0b" color="#f59e0b" />
                         <span className="text-xl font-bold">4.9</span>
                         <span className="text-muted text-sm font-bold">({item.reviews?.length || 0})</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      {item.reviews && item.reviews.length > 0 ? (
                        item.reviews.map(rev => (
                          <div key={rev._id} className="glass-panel p-6 border-slate-100 shadow-sm">
                             <div className="flex justify-between mb-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                      {rev.user?.fullName?.charAt(0) || 'U'}
                                   </div>
                                   <div>
                                      <p className="font-bold text-sm m-0">{rev.user?.fullName || 'Anonymous User'}</p>
                                      <p className="text-[10px] text-muted font-bold m-0">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                   </div>
                                </div>
                                <div className="flex gap-0.5 text-amber-400">
                                   {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} color={i < rev.rating ? 'currentColor' : '#cbd5e1'} />)}
                                </div>
                             </div>
                             <p className="text-muted text-sm italic">"{rev.comment}"</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-10 text-muted border-2 border-dashed rounded-xl">No reviews yet for this listing.</p>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Col: Booking Sidebar */}
        <div className="lg:w-1/3">
           <div className="sidebar p-8">
              <div className="text-center mb-8">
                 <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Rental Price</p>
                 <p className="text-4xl font-bold">₹{item.rentalPrice.toLocaleString('en-IN')}<span className="text-sm text-muted font-normal"> /day</span></p>
              </div>

              {isOwner ? (
                <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-xl text-center">
                   <Package size={40} className="mx-auto text-primary mb-4" />
                   <h4 className="font-bold mb-2">Manager Console</h4>
                   <p className="text-muted text-sm mb-6">This is your listing. Efficiently manage all requests from your dashboard.</p>
                   <Link to="/dashboard" className="btn btn-primary w-full">Go to Dashboard</Link>
                </div>
              ) : (
                <form onSubmit={handleRent} className="space-y-6">
                   <div className="bg-slate-50 p-6 rounded-xl border text-center">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4 block">Select Rental Duration</label>
                      <div className="flex items-center justify-center gap-6">
                         <button type="button" onClick={() => setRentalDays(Math.max(1, rentalDays - 1))} className="w-10 h-10 rounded-full border bg-white flex items-center justify-center shadow-sm hover:border-primary transition-all disabled:opacity-50" disabled={!item.isAvailable}>-</button>
                         <span className="text-3xl font-bold w-12">{rentalDays}</span>
                         <button type="button" onClick={() => setRentalDays(Math.min(30, rentalDays + 1))} className="w-10 h-10 rounded-full border bg-white flex items-center justify-center shadow-sm hover:border-primary transition-all disabled:opacity-50" disabled={!item.isAvailable}>+</button>
                      </div>
                      <p className="text-[10px] text-muted font-bold mt-4 uppercase">Rent for up to 30 days</p>
                   </div>

                   <div className="border-t pt-6 space-y-3">
                      <div className="flex justify-between text-sm">
                         <span className="text-muted">Rental Fee</span>
                         <span className="font-bold">₹{(item.rentalPrice * rentalDays).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-muted">Security Deposit</span>
                         <span className="font-bold text-secondary">₹{(item.depositAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                         <div>
                            <p className="text-[10px] font-bold text-muted uppercase">Total Due</p>
                            <p className="text-3xl font-bold text-primary">₹{((item.rentalPrice * rentalDays) + (item.depositAmount || 0)).toLocaleString('en-IN')}</p>
                         </div>
                         <Info size={20} className="text-slate-200 mb-1" />
                      </div>
                   </div>

                   <button 
                     type="submit" 
                     className="btn btn-primary w-full py-4 text-lg font-bold shadow-xl shadow-primary/20 transform active:scale-95 transition-all disabled:opacity-50" 
                     disabled={!item.isAvailable || renting}
                   >
                     {renting ? 'Reserving...' : item.isAvailable ? 'Reserve Now' : 'Not Available'}
                   </button>
                   <p className="text-center text-[10px] text-muted font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                      <ShieldCheck size={14} /> Encrypted Secure Checkout
                   </p>
                </form>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
