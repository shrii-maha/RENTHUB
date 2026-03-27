import { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { CalendarClock, CreditCard, X, ExternalLink, Download, Package } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const MyRentals = () => {
  const { user } = useContext(AuthContext);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [initiating, setInitiating] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/rentals/my')
        .then(res => {
          setRentals(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  const handlePayment = async (rentalId) => {
    setInitiating(true);
    try {
      const res = await api.post(`/payments/checkout/${rentalId}`);
      window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.error || 'Error initiating payment');
      setInitiating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return 'badge-warning';
      case 'Approved': return 'badge-info';
      case 'Rejected': return 'badge-danger';
      case 'Active': return 'badge-success';
      case 'Completed': return 'badge-success';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="fade-in py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20">
          <CalendarClock size={28} />
        </div>
        <h1 className="text-3xl font-bold">My Rentals</h1>
      </div>

      {loading ? (
        <div className="text-center py-20"><p className="text-muted">Loading your rentals...</p></div>
      ) : rentals.length === 0 ? (
        <div className="glass-panel text-center py-20 border-dashed border-2">
          <h3 className="text-xl font-bold mb-2">No rentals found</h3>
          <p className="text-muted mb-8">You haven't requested any items yet. Start exploring the marketplace!</p>
          <Link to="/items" className="btn btn-primary">Browse Marketplace</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {rentals.map(rental => (
            <div key={rental._id} className="card flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all">
              {/* Item Image */}
              <div className="w-full md:w-48 h-48 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-4 border flex-shrink-0">
                {rental.item?.imageFilename ? (
                  <img
                    src={getImageUrl(rental.item.imageFilename)}
                    alt={rental.item.name}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300 gap-2 font-bold uppercase text-[10px]">
                    <Package size={32} strokeWidth={1.5} />
                    No Image
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-grow flex flex-col justify-between py-2">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">
                      {rental.item ? (
                        <Link to={`/item/${rental.item._id}`} className="hover:text-primary transition-colors">{rental.item.name}</Link>
                      ) : (
                        <span className="text-muted italic">Item Removed</span>
                      )}
                    </h3>
                    <span className={`badge ${getStatusBadge(rental.status)}`}>{rental.status}</span>
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                    Owner: {rental.item?.owner?.fullName || 'N/A'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <p className="text-[10px] text-muted font-bold uppercase mb-1">Fee</p>
                      <p className="text-lg font-bold">₹{rental.totalPrice.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <p className="text-[10px] text-muted font-bold uppercase mb-1">Deposit</p>
                      <p className="text-lg font-bold text-secondary">₹{(rental.depositAmount || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    {rental.status === 'Approved' && (
                       <p className="text-secondary text-sm font-bold flex items-center gap-1">
                          <ShieldCheck size={14} /> Ready for Payment
                       </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {rental.status === 'Approved' && (
                      <button
                        onClick={() => handlePayment(rental._id)}
                        className="btn btn-primary flex items-center gap-2 text-sm px-6 py-2"
                        disabled={initiating}
                      >
                         <CreditCard size={16} /> {initiating ? 'Processing...' : 'Pay Now'}
                      </button>
                    )}
                    {(rental.status === 'Active' || rental.status === 'Completed') && (
                      <Link
                        to={`/invoice/${rental._id}`}
                        className="btn btn-outline flex items-center gap-2 text-sm px-6 py-2"
                      >
                        <Download size={16} /> Invoice
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Internal Helper for QR replacement
const ShieldCheck = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

export default MyRentals;
