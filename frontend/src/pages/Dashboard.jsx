import { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { 
  Settings, Package, DollarSign, List, Edit, Check, X, Trash2, 
  Download, ShieldCheck, RefreshCw, Plus, CreditCard, LayoutDashboard, History, Briefcase, ExternalLink
} from 'lucide-react';
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
    if (user && !user.isAdmin) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  if (user.isAdmin) return <Navigate to="/admin/dashboard" />;

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/dashboard/bank', bankForm);
      setBankEdit(false);
      fetchDashboardData();
    } catch (err) {
      setError('Failed to update bank details');
    }
  };

  const toggleAvailability = async (id) => {
    try {
      await api.patch(`/items/${id}/toggle`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error toggling availability');
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

  if (loading) return <div className="py-20 text-center"><p className="text-muted">Loading your dashboard...</p></div>;
  if (error) return <div className="py-20 text-center text-danger"><p>{error}</p><button onClick={fetchDashboardData} className="btn btn-primary mt-4">Retry</button></div>;

  return (
    <div className="fade-in py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="text-primary" /> Merchant Dashboard
            {user.isVerified && <ShieldCheck size={20} className="text-secondary" title="Verified Owner" />}
          </h1>
          <p className="text-muted">Welcome back, {user.fullName}. Monitor your gear and earnings here.</p>
        </div>
        <Link to="/add-item" className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> List New Item
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <Package className="mx-auto mb-2 text-primary" size={28} />
          <h4 className="text-muted text-sm font-bold uppercase tracking-wider">Your Items</h4>
          <p className="text-3xl font-bold">{data.myItems.length}</p>
        </div>
        <div className="card text-center">
          <DollarSign className="mx-auto mb-2 text-secondary" size={28} />
          <h4 className="text-muted text-sm font-bold uppercase tracking-wider">Total Earnings</h4>
          <p className="text-3xl font-bold">₹{data.earnings.toLocaleString('en-IN')}</p>
        </div>
        <div className="card text-center">
          <History className="mx-auto mb-2 text-accent" size={28} />
          <h4 className="text-muted text-sm font-bold uppercase tracking-wider">Pending Requests</h4>
          <p className="text-3xl font-bold">{data.pendingRequests.length}</p>
        </div>
        <div className="card text-center cursor-pointer hover:border-primary transition-all" onClick={() => setBankEdit(!bankEdit)}>
          <CreditCard className="mx-auto mb-2 text-slate-600" size={28} />
          <h4 className="text-muted text-sm font-bold uppercase tracking-wider">Bank Details</h4>
          <p className="text-sm font-bold text-primary mt-2">Clique to {bankEdit ? 'Close' : 'Update'}</p>
        </div>
      </div>

      {/* Bank Edit Form */}
      {bankEdit && (
        <div className="glass-panel mb-8 fade-in">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Settings size={20} /> Update Bank Payout Details
          </h3>
          <form onSubmit={handleBankSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input type="text" className="form-control" value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Account Holder</label>
              <input type="text" className="form-control" value={bankForm.accountHolderName} onChange={e => setBankForm({...bankForm, accountHolderName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input type="text" className="form-control" value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input type="text" className="form-control" value={bankForm.ifscCode} onChange={e => setBankForm({...bankForm, ifscCode: e.target.value})} />
            </div>
            <div className="lg:col-span-4 mt-2">
              <button type="submit" className="btn btn-primary">Save Bank Details</button>
            </div>
          </form>
        </div>
      )}

      {/* Section Content */}
      <div className="space-y-12">
        {/* Pending Requests */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-accent rounded-full"></div> Incoming Rental Requests
          </h2>
          {data.pendingRequests.length === 0 ? (
            <div className="glass-panel py-12 text-center text-muted border-dashed border-2">
              No pending requests at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.pendingRequests.map(req => (
                <div key={req._id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <span className="badge badge-warning">Pending</span>
                    <span className="font-bold">₹{req.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <h4 className="font-bold mb-2">{req.item?.name}</h4>
                  <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm">
                    <p className="text-muted">Requested by:</p>
                    <p className="font-bold text-slate-700">{req.renter?.fullName}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRentalAction(req._id, 'approve')} className="btn btn-secondary flex-grow flex items-center gap-2">
                      <Check size={16} /> Approve
                    </button>
                    <button onClick={() => handleRentalAction(req._id, 'reject')} className="btn btn-outline text-danger border-danger hover:bg-danger hover:text-white px-3">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Items */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
             <div className="w-1 h-6 bg-primary rounded-full"></div> Your Listed Items
          </h2>
          {data.myItems.length === 0 ? (
            <div className="glass-panel py-12 text-center text-muted border-dashed border-2">
              You haven't listed any items yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.myItems.map(item => (
                <div key={item._id} className="card group">
                  <div className="aspect-video bg-slate-50 rounded-lg overflow-hidden relative mb-4">
                    {item.imageFilename ? (
                      <img src={getImageUrl(item.imageFilename)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted text-xs uppercase font-bold">No Image</div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Link to={`/edit-item/${item._id}`} className="p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-primary transition-colors">
                        <Edit size={14} />
                      </Link>
                      <button onClick={() => deleteItem(item._id)} className="p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-danger transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold mb-2 truncate" title={item.name}>{item.name}</h4>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">₹{item.rentalPrice}</span>
                    <span className={`badge ${item.isAvailable ? 'badge-success' : 'bg-slate-200 text-slate-600'}`}>{item.isAvailable ? 'Active' : 'Hidden'}</span>
                  </div>
                  <button 
                    onClick={() => toggleAvailability(item._id)} 
                    className="btn btn-outline w-full text-xs py-2 flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> {item.isAvailable ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Transaction History */}
        <section>
           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-secondary rounded-full"></div> Recent Transactions
           </h2>
           <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                       <tr className="text-xs font-bold text-muted uppercase tracking-wider">
                          <th className="px-6 py-4">Item</th>
                          <th className="px-6 py-4">Renter</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Revenue</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y">
                       {data.rentedOut.length === 0 ? (
                         <tr><td colSpan="5" className="px-6 py-12 text-center text-muted">No transactions recorded.</td></tr>
                       ) : (
                         data.rentedOut.map(deal => (
                           <tr key={deal._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                 <p className="font-bold text-slate-800">{deal.item?.name}</p>
                                 <p className="text-xs text-muted">{new Date(deal.createdAt).toLocaleDateString()}</p>
                              </td>
                              <td className="px-6 py-4">
                                 <p className="font-medium text-slate-700">{deal.renter?.fullName}</p>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={`badge ${deal.status === 'Active' ? 'badge-success' : deal.status === 'Completed' ? 'badge-info' : 'bg-slate-100 text-slate-500'}`}>{deal.status}</span>
                              </td>
                              <td className="px-6 py-4 font-bold text-lg">
                                 ₹{deal.totalPrice.toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <Link to={`/invoice/${deal._id}`} className="text-primary hover:text-primary-hover inline-flex items-center gap-1 font-bold text-sm">
                                    <Download size={16} /> Invoice
                                 </Link>
                              </td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
