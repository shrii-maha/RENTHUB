import { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { CalendarClock, CreditCard, QrCode, X, ExternalLink, Download } from 'lucide-react';

const MyRentals = () => {
  const { user } = useContext(AuthContext);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [currentRental, setCurrentRental] = useState(null);
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

  const handlePayment = async (rental) => {
    setInitiating(true);
    try {
      const res = await api.post(`/payments/checkout/${rental._id}`);
      setCheckoutUrl(res.data.url);
      setCurrentRental(rental);
      setShowModal(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Error initiating payment');
    } finally {
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
    <div className="fade-in py-4">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <div className="bg-primary text-white p-3 rounded-full">
          <CalendarClock size={28} />
        </div>
        <h1 style={{ margin: 0 }}>My Rentals</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading rentals...</div>
      ) : rentals.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-muted">You haven't rented any items yet.</h3>
          <Link to="/items" className="btn btn-primary mt-4">Browse Items</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-4xl">
          {rentals.map(rental => (
            <div key={rental._id} className="card p-0 overflow-hidden flex" style={{ flexDirection: 'row' }}>
              <div style={{ width: '200px', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
                {rental.item?.imageFilename ? (
                  <img src={`http://localhost:5000/uploads/${rental.item.imageFilename}`} alt={rental.item.name} className="object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2><Link to={`/item/${rental.item?._id}`}>{rental.item?.name || 'Deleted Item'}</Link></h2>
                    <span className={`badge ${getStatusBadge(rental.status)}`}>{rental.status}</span>
                  </div>
                  <p className="text-muted mb-1">Owner: {rental.item?.owner?.fullName || 'Unknown'}</p>
                  <p className="font-bold text-lg mb-4">Total: ₹{rental.totalPrice}</p>
                </div>
                
                <div className="pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                  {rental.status === 'Pending' && (
                    <p className="text-amber-600 text-sm m-0 italic">Waiting for owner approval...</p>
                  )}
                  {rental.status === 'Approved' && (
                    <div className="flex justify-between items-center">
                      <p className="text-emerald-600 font-medium m-0 flex items-center gap-1">Request Approved! Ready for payment.</p>
                      <button 
                        onClick={() => handlePayment(rental)} 
                        className="btn btn-primary flex items-center gap-2"
                        disabled={initiating}
                      >
                        <CreditCard size={18} /> {initiating ? 'Processing...' : `Pay ₹${rental.totalPrice}`}
                      </button>
                    </div>
                  )}
                  {rental.status === 'Rejected' && (
                    <p className="text-rose-600 text-sm m-0">The owner rejected this rental request.</p>
                  )}
                  {rental.status === 'Active' && (
                    <div className="flex justify-between items-center w-full">
                      <p className="text-emerald-600 font-bold flex items-center gap-2 m-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active Rental
                      </p>
                      <Link to={`/invoice/${rental._id}`} className="btn btn-outline text-xs py-1 px-3 flex items-center gap-1">
                         <Download size={14} /> View Invoice
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Payment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-muted hover:text-primary transition-colors" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowModal(false)}>
              <X size={24} />
            </button>
            
            <h2 className="mb-2">Scan to Pay</h2>
            <p className="text-muted text-sm px-4">Scan the QR code with your phone or select UPI/Card on the payment page.</p>
            
            <div className="qr-container">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(checkoutUrl)}`} 
                alt="Payment QR Code" 
                className="qr-image"
              />
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <a href={checkoutUrl} className="btn btn-primary btn-block flex items-center justify-center gap-2">
                <ExternalLink size={18} /> Go to Payment Page
              </a>
              <button onClick={() => setShowModal(false)} className="btn btn-outline btn-block">
                Close
              </button>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted font-medium uppercase tracking-wider">
              <span className="flex items-center gap-1"><CreditCard size={12} /> Cards</span>
              <span className="flex items-center gap-1"><QrCode size={12} /> UPI</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRentals;
