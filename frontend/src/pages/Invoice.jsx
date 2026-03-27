import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Printer, ArrowLeft, CheckCircle2, Calendar, Package, User, Phone, Mail, MapPin } from 'lucide-react';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/payments/invoice/${id}`);
        setRental(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch invoice');
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted">Loading invoice...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-12 text-center">
      <div className="badge-danger p-4 rounded mb-4">{error}</div>
      <button onClick={() => navigate(-1)} className="btn btn-outline flex items-center gap-2 mx-auto">
        <ArrowLeft size={18} /> Go Back
      </button>
    </div>
  );

  const { item, renter, totalPrice, depositAmount, depositStatus, createdAt, returnDate, rentalDate, status, _id } = rental;
  const owner = item.owner;

  // Calculate days rented
  const startDate = new Date(rentalDate || createdAt);
  const endDate = returnDate ? new Date(returnDate) : null;
  const days = endDate
    ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
    : null;

  const deposit = depositAmount || 0;
  const grandTotal = totalPrice + deposit;

  return (
    <div className="fade-in py-8 max-w-4xl mx-auto">
      {/* Action Buttons — hidden on print */}
      <div className="hide-on-print flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-outline flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Printer size={18} /> Print / Save PDF
        </button>
      </div>

      {/* ── Invoice Card ── */}
      <div className="overflow-hidden bg-white shadow-2xl rounded-2xl border-t-8 border-primary" id="invoice">

        {/* Header */}
        <div className="p-8 flex justify-between items-start" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)' }}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-sm">RH</div>
              <h1 className="text-primary font-bold mb-0" style={{ fontSize: '1.75rem' }}>RentHub</h1>
            </div>
            <p className="text-muted text-sm m-0">Premium Peer-to-Peer Rental Platform</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-3">
              <CheckCircle2 size={16} /> PAID
            </div>
            <p className="text-2xl font-bold text-slate-700 m-0">INVOICE</p>
            <p className="font-mono text-primary font-bold text-lg m-0">#INV-{_id.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-muted mt-1">Date: {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="p-8">

          {/* Buyer & Seller Info */}
          <div className="grid gap-8 mb-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* Buyer */}
            <div className="p-5 rounded-xl" style={{ background: '#f8faff', border: '1px solid #e0e7ff' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-1">
                <User size={13} /> Billed To (Renter)
              </p>
              <p className="font-bold text-lg text-slate-800 mb-1">{renter.fullName}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1 mb-1"><Mail size={13} /> {renter.email}</p>
              {renter.phoneNumber && <p className="text-sm text-slate-500 flex items-center gap-1 mb-1"><Phone size={13} /> {renter.phoneNumber}</p>}
              {renter.address && <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={13} /> {renter.address}</p>}
            </div>
            {/* Seller */}
            <div className="p-5 rounded-xl" style={{ background: '#f8faff', border: '1px solid #e0e7ff' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3 flex items-center gap-1">
                <Package size={13} /> Item Owner (Seller)
              </p>
              <p className="font-bold text-lg text-slate-800 mb-1">{owner.fullName}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1 mb-1"><Mail size={13} /> {owner.email}</p>
              {owner.phoneNumber && <p className="text-sm text-slate-500 flex items-center gap-1 mb-1"><Phone size={13} /> {owner.phoneNumber}</p>}
              {owner.address && <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={13} /> {owner.address}</p>}
            </div>
          </div>

          {/* Rental Dates */}
          <div className="flex gap-6 mb-8 p-4 rounded-xl" style={{ background: '#fefce8', border: '1px solid #fde68a' }}>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-amber-600" />
              <div>
                <p className="text-xs text-amber-700 font-bold uppercase tracking-wider m-0">Rental Start</p>
                <p className="font-bold text-slate-800 m-0">{startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            {endDate && (
              <>
                <div className="text-amber-400 flex items-center font-bold">→</div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-amber-600" />
                  <div>
                    <p className="text-xs text-amber-700 font-bold uppercase tracking-wider m-0">Return Date</p>
                    <p className="font-bold text-slate-800 m-0">{endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div>
                    <p className="text-xs text-amber-700 font-bold uppercase tracking-wider m-0 text-right">Duration</p>
                    <p className="font-bold text-slate-800 m-0 text-right">{days} {days === 1 ? 'day' : 'days'}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-10 rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th className="p-4 text-xs uppercase tracking-widest text-slate-500 font-bold">Description</th>
                  <th className="p-4 text-xs uppercase tracking-widest text-slate-500 font-bold text-center">Category</th>
                  <th className="p-4 text-xs uppercase tracking-widest text-slate-500 font-bold text-right">Rate</th>
                  {days && <th className="p-4 text-xs uppercase tracking-widest text-slate-500 font-bold text-center">Days</th>}
                  <th className="p-4 text-xs uppercase tracking-widest text-slate-500 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-4">
                    <p className="font-bold text-slate-800 mb-0">{item.name}</p>
                    <p className="text-xs text-muted max-w-xs mt-1 mb-0">{item.description?.slice(0, 80)}{item.description?.length > 80 ? '...' : ''}</p>
                  </td>
                  <td className="p-4 text-center capitalize text-slate-600">{item.category}</td>
                  <td className="p-4 text-right text-slate-600">₹{item.rentalPrice}/day</td>
                  {days && <td className="p-4 text-center text-slate-600">{days}</td>}
                  <td className="p-4 text-right font-bold text-slate-800">₹{totalPrice.toLocaleString('en-IN')}</td>
                </tr>
                {deposit > 0 && (
                  <tr className="border-t" style={{ background: '#fffbeb' }}>
                    <td className="p-4" colSpan={days ? 3 : 2}>
                      <p className="font-semibold text-amber-700 mb-0">Security Deposit</p>
                      <p className="text-xs text-amber-600 mt-1 mb-0">
                        Refund status: <span className={`font-bold ${depositStatus === 'Refunded' ? 'text-emerald-600' : 'text-amber-600'}`}>{depositStatus}</span>
                      </p>
                    </td>
                    {days && <td className="p-4 text-center text-amber-600">—</td>}
                    <td className="p-4 text-right font-bold text-amber-700">₹{deposit.toLocaleString('en-IN')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div style={{ width: '300px' }}>
              <div className="flex justify-between py-2 border-b text-slate-600">
                <span>Rental Cost</span>
                <span className="font-medium">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              {deposit > 0 && (
                <div className="flex justify-between py-2 border-b text-amber-600">
                  <span>Security Deposit</span>
                  <span className="font-medium">₹{deposit.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b text-slate-600">
                <span>Platform Fee</span>
                <span className="font-medium">₹0.00</span>
              </div>
              <div className="flex justify-between py-4 text-2xl font-bold text-primary">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold mt-2">
                <CheckCircle2 size={18} />
                <span>Payment Completed via Stripe</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 text-center" style={{ background: '#f8faff', borderTop: '2px dashed #e0e7ff' }}>
          <p className="text-sm font-bold text-primary mb-1">Thank you for using RentHub! 🎉</p>
          <p className="text-xs text-muted mb-1">This is a system-generated invoice and does not require a physical signature.</p>
          <p className="text-xs text-muted">Rental ID: {_id} · Status: <span className="font-bold text-primary">{status}</span></p>
          <p className="text-xs text-muted mt-2">© {new Date().getFullYear()} RentHub Inc. — Premium Rental Platform</p>
        </div>
      </div>

      <style>{`
        @media print {
          .hide-on-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          #invoice { width: 100% !important; box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
