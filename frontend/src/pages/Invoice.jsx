import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Printer, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="text-center py-12">Loading invoice...</div>;
  if (error) return (
    <div className="max-w-md mx-auto mt-12 text-center">
      <div className="badge-danger p-4 rounded mb-4">{error}</div>
      <button onClick={() => navigate(-1)} className="btn btn-outline flex items-center gap-2 mx-auto">
        <ArrowLeft size={18} /> Go Back
      </button>
    </div>
  );

  const { item, renter, totalPrice, createdAt, _id } = rental;
  const owner = item.owner;

  return (
    <div className="fade-in py-8 max-w-4xl mx-auto">
      <div className="hide-on-print flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-outline flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="btn btn-primary flex items-center gap-2">
            <Printer size={18} /> Print Invoice
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden bg-white shadow-xl border-t-8 border-primary rounded-xl" id="invoice">
        {/* Header */}
        <div className="p-8 bg-slate-50 border-b flex justify-between items-start">
          <div>
            <h1 className="text-primary font-bold mb-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white text-sm">RH</div>
              RentHub
            </h1>
            <p className="text-muted text-sm">Premium Peer-to-Peer Rental Platform</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-700">Invoice</h2>
            <p className="font-medium">#INV-{_id.slice(-6).toUpperCase()}</p>
            <p className="text-sm text-muted">Date: {new Date(createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-12 mb-10">
            <div>
              <h3 className="text-sm uppercase text-muted font-bold mb-3 border-b pb-1">Billed To (Buyer)</h3>
              <p className="font-bold text-lg mb-1">{renter.fullName}</p>
              <p className="text-sm text-slate-600 mb-1">{renter.email}</p>
              <p className="text-sm text-slate-600 mb-1">{renter.phoneNumber}</p>
              <p className="text-sm text-slate-600">{renter.address}</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm uppercase text-muted font-bold mb-3 border-b pb-1 text-right">Owner (Seller)</h3>
              <p className="font-bold text-lg mb-1">{owner.fullName}</p>
              <p className="text-sm text-slate-600 mb-1">{owner.email}</p>
              <p className="text-sm text-slate-600 mb-1">{owner.phoneNumber}</p>
              <p className="text-sm text-slate-600">{owner.address}</p>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-sm uppercase text-muted font-bold mb-4 border-b pb-1">Rental Details</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-xs font-bold">
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Category</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-muted max-w-xs">{item.description.slice(0, 100)}...</p>
                  </td>
                  <td className="p-4 text-center capitalize">{item.category}</td>
                  <td className="p-4 text-right">₹{item.rentalPrice} / day</td>
                  <td className="p-4 text-right font-bold">₹{totalPrice}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-3 border border-emerald-100">
              <CheckCircle2 size={24} />
              <div>
                <p className="font-bold text-sm leading-none mb-1 uppercase tracking-tight">Payment Status</p>
                <p className="text-lg font-bold leading-none">PAID FULLY</p>
              </div>
            </div>
            
            <div className="w-64">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted">Platform Fee</span>
                <span className="font-medium">₹0.00</span>
              </div>
              <div className="flex justify-between py-4 text-2xl font-bold text-primary">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 text-center border-t border-dashed">
          <p className="text-sm font-bold text-slate-600 mb-1 italic">Thank you for your business!</p>
          <p className="text-xs text-muted">This is a system generated invoice and does not require a signature.</p>
          <p className="text-xs text-muted mt-2">© {new Date().getFullYear()} RentHub Inc.</p>
        </div>
      </div>

      <style>{`
        @media print {
          .hide-on-print { display: none !important; }
          body { background: white !important; }
          .container { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .card { border: none !important; box-shadow: none !important; }
          #invoice { width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
