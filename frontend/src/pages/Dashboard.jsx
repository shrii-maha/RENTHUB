import { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { Settings, Package, DollarSign, List, Edit, Check, X, Trash2, Download, ShieldCheck } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [bankEdit, setBankEdit] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: ''
  });

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data.data);
      if (res.data.data.bankDetails) {
        setBankForm({
          bankName: res.data.data.bankDetails.bankName || '',
          accountHolderName: res.data.data.bankDetails.accountHolderName || '',
          accountNumber: res.data.data.bankDetails.accountNumber || '',
          ifscCode: res.data.data.bankDetails.ifscCode || ''
        });
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        setLoading(false);
      } else {
        fetchDashboardData();
      }
    }
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  if (user.isAdmin) return <Navigate to="/admin/dashboard" />;

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/dashboard/bank', bankForm);
      setBankEdit(false);
      // alert or success toast could go here
    } catch (err) {
      setError('Failed to update bank details');
    }
  };

  const toggleAvailability = async (id) => {
    if (window.confirm('Toggle availability for this item?')) {
      try {
        await api.patch(`/items/${id}/toggle`);
        fetchDashboardData();
      } catch (err) {
        alert(err.response?.data?.error || 'Error toggling availability');
      }
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/items/${id}`);
        fetchDashboardData();
      } catch (err) {
        alert('Error deleting item');
      }
    }
  };
  const handleRentalAction = async (id, action) => {
    try {
      await api.patch(`/rentals/${id}/${action}`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || `Error ${action} rental`);
    }
  };

  const refundDeposit = async (id) => {
    if (window.confirm('Refund security deposit for this rental?')) {
      try {
        await api.patch(`/rentals/${id}/refund-deposit`);
        alert('Deposit refunded successfully!');
        fetchDashboardData();
      } catch (err) {
        alert(err.response?.data?.error || 'Error refunding deposit');
      }
    }
  };

  if (loading) return <div className="text-center mt-12">Loading dashboard...</div>;
  if (error) return <div className="badge-danger p-4 text-center mt-8">{error}</div>;

  return (
    <div className="fade-in py-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ marginBottom: 0 }} className="flex items-center gap-2">
            Dashboard 
            {user.isVerified && <ShieldCheck size={28} className="text-emerald-500" title="Verified User" />}
          </h1>
          <p className="text-muted">Welcome back, {user.fullName}</p>
        </div>
        <Link to="/add-item" className="btn btn-primary"><Package size={18} /> Add New Item</Link>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card text-center justify-center flex flex-col">
          <div className="text-primary mb-2 flex justify-center"><Package size={28} /></div>
          <h2>{data.myItems.length}</h2>
          <p className="text-muted">My Items</p>
        </div>
        <div className="card text-center justify-center flex flex-col">
          <div className="text-secondary mb-2 flex justify-center"><DollarSign size={28} /></div>
          <h2>₹{data.earnings}</h2>
          <p className="text-muted">Total Earnings</p>
        </div>
        <div className="card text-center justify-center flex flex-col">
          <div className="text-accent mb-2 flex justify-center"><List size={28} /></div>
          <h2>{data.pendingRequests.length}</h2>
          <p className="text-muted">Pending Requests</p>
        </div>
        <div className="card text-center justify-center flex flex-col cursor-pointer hover:bg-slate-50" onClick={() => setBankEdit(!bankEdit)}>
          <div className="text-primary mb-2 flex justify-center"><Settings size={28} /></div>
          <h3 className="mt-2 text-lg">Bank Details</h3>
          <p className="text-muted text-sm">Update payout info</p>
        </div>
      </div>

      {bankEdit && (
        <div className="card mb-8 glass-panel fade-in">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-primary">Edit Bank Details</h3>
            <button className="btn btn-outline" style={{ padding: '0.25rem' }} onClick={() => setBankEdit(false)}><X size={20} /></button>
          </div>
          <form onSubmit={handleBankSubmit} className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2 sm:col-span-1">
              <label className="form-label">Bank Name</label>
              <input type="text" className="form-control" name="bankName" value={bankForm.bankName} onChange={e=>setBankForm({...bankForm, bankName: e.target.value})} />
            </div>
            <div className="form-group col-span-2 sm:col-span-1">
              <label className="form-label">Account Holder Name</label>
              <input type="text" className="form-control" name="accountHolderName" value={bankForm.accountHolderName} onChange={e=>setBankForm({...bankForm, accountHolderName: e.target.value})} />
            </div>
            <div className="form-group col-span-2 sm:col-span-1">
              <label className="form-label">Account Number</label>
              <input type="text" className="form-control" name="accountNumber" value={bankForm.accountNumber} onChange={e=>setBankForm({...bankForm, accountNumber: e.target.value})} />
            </div>
            <div className="form-group col-span-2 sm:col-span-1">
              <label className="form-label">IFSC Code</label>
              <input type="text" className="form-control" name="ifscCode" value={bankForm.ifscCode} onChange={e=>setBankForm({...bankForm, ifscCode: e.target.value})} />
            </div>
            <div className="col-span-2 mt-2">
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8 my-8" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card overflow-hidden" style={{ overflowX: 'auto' }}>
          <h2 className="mb-4 text-2xl border-b pb-2">Pending Rental Requests</h2>
          {data.pendingRequests.length === 0 ? (
            <p className="text-muted">No pending requests.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Renter</th>
                  <th className="py-2">Item</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingRequests.map(req => (
                  <tr key={req._id} className="border-b">
                     <td className="py-3">{req.renter?.fullName}</td>
                     <td className="py-3 font-medium text-primary">{req.item?.name}</td>
                     <td className="py-3">₹{req.totalPrice}</td>
                     <td className="py-3 flex gap-2">
                       <button onClick={() => handleRentalAction(req._id, 'approve')} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} title="Approve"><Check size={16} /></button>
                       <button onClick={() => handleRentalAction(req._id, 'reject')} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} title="Reject"><X size={16} /></button>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card mb-8 overflow-hidden">
        <h2 className="mb-4 text-2xl border-b pb-2">Deal History (Rented Out)</h2>
        {data.rentedOut.length === 0 ? (
          <p className="text-muted">No past or active deals yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Date</th>
                <th className="py-2">Item</th>
                <th className="py-2">Renter</th>
                <th className="py-2">Total Price</th>
                <th className="py-2">Deposit Status</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...data.rentedOut].reverse().map(deal => (
                <tr key={deal._id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-sm">{new Date(deal.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 font-medium text-primary">{deal.item?.name}</td>
                  <td className="py-3">
                    <div className="text-sm font-bold">{deal.renter?.fullName}</div>
                    <div className="text-xs text-muted">{deal.renter?.email}</div>
                  </td>
                  <td className="py-3">₹{deal.totalPrice} <span className="text-xs text-muted block">+ ₹{deal.depositAmount || 0} deposit</span></td>
                  <td className="py-3">
                    <span className={`badge ${deal.depositStatus === 'Refunded' ? 'badge-success' : 'badge-warning'}`}>
                      {deal.depositStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`badge ${deal.status === 'Active' ? 'badge-success' : 'badge-info'}`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="py-3 flex flex-col gap-1">
                    <Link to={`/invoice/${deal._id}`} className="btn btn-outline text-xs py-1 px-2 flex items-center justify-center gap-1" style={{ minWidth: '100px' }}>
                      <Download size={12} /> Bill
                    </Link>
                    {deal.depositStatus === 'Held' && (
                      <button 
                        onClick={() => refundDeposit(deal._id)} 
                        className="btn btn-secondary text-xs py-1 px-2"
                        style={{ minWidth: '100px' }}
                      >
                        Refund Deposit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card mb-8 overflow-hidden">
        <h2 className="mb-4 text-2xl border-b pb-2">My Listed Items</h2>
        {data.myItems.length === 0 ? (
          <p className="text-muted">You haven't listed any items yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Image</th>
                <th className="py-2">Name</th>
                <th className="py-2">Category</th>
                <th className="py-2">Price</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.myItems.map(item => (
                <tr key={item._id} className="border-b">
                  <td className="py-3">
                    <img src={getImageUrl(item.imageFilename) || 'https://via.placeholder.com/50'} alt={item.name} className="object-cover rounded" style={{ width: '50px', height: '50px' }} />
                  </td>
                  <td className="py-3 font-medium"><Link to={`/item/${item._id}`}>{item.name}</Link></td>
                  <td className="py-3 capitalize">{item.category}</td>
                  <td className="py-3">₹{item.rentalPrice}/day</td>
                  <td className="py-3">
                    <span className={`badge ${item.isAvailable ? 'badge-success' : 'badge-warning'}`}>
                      {item.isAvailable ? 'Available' : 'Rented/Unavailable'}
                    </span>
                  </td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => toggleAvailability(item._id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} title="Toggle Availability">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteItem(item._id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
