import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Star, ShieldCheck, User } from 'lucide-react';

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
      // Refresh page
      const res = await api.get(`/items/${id}`);
      setData(res.data.data);
      setReviewComment('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error submitting review');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!data || !data.item) return <div className="text-center py-12">Item not found.</div>;

  const { item, relatedItems } = data;
  const isOwner = user && user.id === item.owner._id;

  return (
    <div className="fade-in py-4 pb-12">
      <div className="grid grid-cols-3 gap-8 mb-12" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        
        {/* Left Col - Image & Details */}
        <div className="flex flex-col gap-6">
          <div className="card p-0 overflow-hidden" style={{ borderRadius: '16px' }}>
            <div style={{ height: '400px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.imageFilename ? (
                <img src={`http://localhost:5000/uploads/${item.imageFilename}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="text-muted text-lg flex items-center gap-2"><Package size={24}/> No Image Provided</span>
              )}
            </div>
          </div>
          
          <div className="card">
            <h2>Description</h2>
            <p className="whitespace-pre-wrap">{item.description}</p>
            
            <div className="mt-6 pt-6 border-t flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted">
                <ShieldCheck size={20} className="text-primary" />
                <span>Verified Owner: {item.owner.fullName}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Reviews</h2>
            {item.reviews && item.reviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {item.reviews.map(rev => (
                  <div key={rev._id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium flex items-center gap-2">
                        <User size={16} /> {rev.user?.fullName || 'Anonymous'}
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < rev.rating ? 'currentColor' : 'none'} color={i < rev.rating ? 'currentColor' : '#cbd5e1'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted text-sm m-0">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted m-0">No reviews yet.</p>
            )}

            {!isOwner && user && (
              <div className="mt-8 bg-slate-50 p-4 rounded-lg border">
                <h3 className="mb-4 text-lg">Leave a Review</h3>
                <form onSubmit={handleReview}>
                  <div className="form-group mb-2">
                    <label className="form-label">Rating</label>
                    <select className="form-control" value={reviewRating} onChange={e=>setReviewRating(e.target.value)} required>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                  <div className="form-group mb-4">
                    <label className="form-label">Comment</label>
                    <textarea className="form-control" rows="2" value={reviewComment} onChange={e=>setReviewComment(e.target.value)} required></textarea>
                  </div>
                  <button type="submit" className="btn btn-secondary btn-sm" disabled={reviewing}>Submit Review</button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Col - Rent Form */}
        <div className="flex flex-col gap-6">
          <div className="card sticky top-24">
            <div className="mb-6">
              <span className="badge badge-info uppercase mb-2">{item.category}</span>
              <h1 className="mb-2" style={{ fontSize: '2rem' }}>{item.name}</h1>
              <div className="text-3xl font-bold text-primary">₹{item.rentalPrice} <span className="text-lg text-muted font-normal">/ day</span></div>
            </div>

            <div className="mb-6">
              {item.isAvailable ? (
                <span className="badge badge-success px-3 py-1 text-sm bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Available Now
                </span>
              ) : (
                <span className="badge badge-danger px-3 py-1 text-sm bg-rose-100 text-rose-800 flex items-center gap-1 w-max">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div> Currently Rented
                </span>
              )}
            </div>

            {isOwner ? (
              <div className="bg-blue-50 text-blue-800 border-l-4 border-blue-500 p-4 mb-4">
                <p className="font-bold flex items-center gap-2 m-0"><User size={20}/> This is your item</p>
                <p className="text-sm mt-1 mb-0 mt-2">Manage this item from your dashboard.</p>
                <Link to="/dashboard" className="btn btn-primary btn-sm mt-4 w-full text-center block">Go to Dashboard</Link>
              </div>
            ) : (
              <form onSubmit={handleRent} className="border-t pt-6">
                {rentalError && <div className="badge-danger p-3 rounded mb-4 text-sm">{rentalError}</div>}
                
                <div className="form-group">
                  <label className="form-label font-bold">Rental Duration (Days)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className="form-control font-bold text-center text-xl" 
                      min="1" max="30" 
                      value={rentalDays} 
                      onChange={(e) => setRentalDays(parseInt(e.target.value) || 1)}
                      required 
                      disabled={!item.isAvailable}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg mb-6 border">
                  <div className="flex justify-between mb-2 text-muted">
                    <span>₹{item.rentalPrice} x {rentalDays} days</span>
                    <span>₹{item.rentalPrice * rentalDays}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-lg mt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{item.rentalPrice * rentalDays}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-block text-lg py-3" 
                  disabled={!item.isAvailable || renting}
                >
                  {renting ? 'Requesting...' : item.isAvailable ? 'Request to Rent' : 'Item Unavailable'}
                </button>
                <p className="text-center text-muted text-sm mt-4 m-0">You won't be charged until the owner approves.</p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* More from category */}
      {relatedItems && relatedItems.length > 0 && (
        <section>
          <h2 className="border-b pb-2 mb-6">Similar Items</h2>
          <div className="grid grid-cols-3 gap-6">
             {/* Simple mapping for related items - reuse card styles */}
             {relatedItems.map(item => (
                <div key={item._id} className="card p-0 overflow-hidden flex flex-col">
                  <Link to={`/item/${item._id}`} style={{ display: 'block' }}>
                    <div style={{ height: '140px', backgroundColor: '#e2e8f0', backgroundImage: `url(http://localhost:5000/uploads/${item.imageFilename})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      {!item.imageFilename && <div className="w-full h-full flex items-center justify-center text-muted text-sm">No Image</div>}
                    </div>
                  </Link>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }} className="line-clamp-1"><Link to={`/item/${item._id}`}>{item.name}</Link></h3>
                    <div className="mt-auto flex justify-between items-center text-sm">
                      <span className="font-bold text-primary">₹{item.rentalPrice}/day</span>
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

export default ItemDetail;
