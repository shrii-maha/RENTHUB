import { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { 
  Settings, Package, DollarSign, List, Edit, Check, X, Trash2, 
  Download, ShieldCheck, RefreshCw, Plus, ArrowRight, User, 
  CreditCard, LayoutDashboard, History, Briefcase, ExternalLink, PackageOpen
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 animate-pulse">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-slate-400 font-medium">Sycing Dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto text-center py-12">
       <div className="bg-rose-50 text-rose-600 p-6 rounded-3xl border border-rose-100 shadow-xl">
          <p className="font-bold mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-danger">Retry</button>
       </div>
    </div>
  );

  return (
    <div className="fade-in max-w-7xl mx-auto px-4 py-8 pb-20">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-3">
            <LayoutDashboard size={36} className="text-primary" /> 
            Merchant <span className="text-primary">Console</span>
            {user.isVerified && <ShieldCheck size={24} className="text-emerald-500" title="Verified Marketplace Partner" />}
          </h1>
          <p className="text-slate-500 font-medium">Hello, {user.fullName}. Here is your store performance.</p>
        </div>
        <Link to="/add-item" className="btn btn-primary px-8 py-3 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all">
          <Plus size={20} /> List New Item
        </Link>
      </div>

      {/* ── Stats Shelf ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
           <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary mb-4">
              <Package size={24} />
           </div>
           <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900">{data.myItems.length}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Listings</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
           <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
              <DollarSign size={24} />
           </div>
           <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900">₹{data.earnings.toLocaleString('en-IN')}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Earnings</span>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
           <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-4">
              <History size={24} />
           </div>
           <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900">{data.pendingRequests.length}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Deals</span>
           </div>
        </div>
        <div 
          onClick={() => setBankEdit(!bankEdit)} 
          className="bg-slate-900 p-6 rounded-[32px] shadow-2xl cursor-pointer transform hover:scale-105 transition-all group overflow-hidden relative"
        >
           {/* Abstract Circle Decoration */}
           <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors"></div>
           
           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-4">
              <CreditCard size={24} />
           </div>
           <div className="flex flex-col text-white">
              <span className="text-lg font-black leading-tight">Payout<br/>Settings</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1">Configure &rarr;</span>
           </div>
        </div>
      </div>

      {/* ── Bank Edit Form (Premium Integration) ── */}
      {bankEdit && (
        <div className="bg-white p-8 rounded-[40px] border border-primary/20 shadow-2xl shadow-primary/5 mb-12 fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
               <Settings size={28} className="text-primary" /> Bank Payout Details
            </h3>
            <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all" onClick={() => setBankEdit(false)}><X size={20} /></button>
          </div>
          <form onSubmit={handleBankSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="form-group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Bank Name</label>
              <input type="text" className="form-control" style={{ borderRadius: '16px', height: '54px' }} placeholder="e.g. HDFC Bank" value={bankForm.bankName} onChange={e=>setBankForm({...bankForm, bankName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Holder Name</label>
              <input type="text" className="form-control" style={{ borderRadius: '16px', height: '54px' }} placeholder="Full name on account" value={bankForm.accountHolderName} onChange={e=>setBankForm({...bankForm, accountHolderName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Account Number</label>
              <input type="text" className="form-control" style={{ borderRadius: '16px', height: '54px' }} placeholder="0000 0000 0000" value={bankForm.accountNumber} onChange={e=>setBankForm({...bankForm, accountNumber: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">IFSC Code</label>
              <input type="text" className="form-control" style={{ borderRadius: '16px', height: '54px' }} placeholder="BANK0001234" value={bankForm.ifscCode} onChange={e=>setBankForm({...bankForm, ifscCode: e.target.value})} />
            </div>
            <div className="md:col-span-4 mt-2">
              <button type="submit" className="btn btn-primary px-10 py-4 rounded-xl shadow-lg shadow-primary/20">Update Payout info</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Workspace Sections ── */}
      <div className="space-y-16">
        
        {/* Pending Requests Shelf */}
        <section>
          <div className="flex items-center gap-3 mb-8">
             <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active <span className="text-slate-400">Requests</span></h2>
          </div>
          
          {data.pendingRequests.length === 0 ? (
            <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[40px] py-16 text-center">
               <PackageOpen size={64} className="text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">All caught up! No active requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {data.pendingRequests.map(req => (
                 <div key={req._id} className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                       <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Pending</span>
                       <span className="text-xl font-black text-slate-900">₹{req.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mb-6">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Items</p>
                       <h4 className="text-lg font-black text-slate-800 line-clamp-1">{req.item?.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 mb-8 p-3 bg-slate-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{req.renter?.fullName?.charAt(0)}</div>
                       <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest m-0">Requester</p>
                          <p className="text-sm font-bold text-slate-700 m-0">{req.renter?.fullName}</p>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <button 
                         onClick={() => handleRentalAction(req._id, 'approve')} 
                         className="flex-grow btn btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
                       >
                         <Check size={18} /> Approve
                       </button>
                       <button 
                         onClick={() => handleRentalAction(req._id, 'reject')} 
                         className="btn btn-outline py-3 px-4 border-slate-100 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all font-bold"
                       >
                         Reject
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </section>

        {/* History / Dealers Section (Modern List) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Deal <span className="text-slate-400">History</span></h2>
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
             {data.rentedOut.length === 0 ? (
               <div className="py-24 text-center">
                  <Briefcase size={64} className="text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No transaction history yet.</p>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-8 py-6">Transaction</th>
                          <th className="px-6 py-6">Client</th>
                          <th className="px-6 py-6">Status</th>
                          <th className="px-6 py-6 text-right">Revenue</th>
                          <th className="px-8 py-6 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                       {[...data.rentedOut].reverse().map(deal => (
                         <tr key={deal._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                     <Package size={20} />
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-slate-800 m-0">{deal.item?.name}</p>
                                     <p className="text-[10px] text-slate-400 font-bold m-0">{new Date(deal.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-6">
                               <p className="text-sm font-bold text-slate-700 m-0">{deal.renter?.fullName}</p>
                               <p className="text-[10px] text-slate-400 m-0">{deal.renter?.email}</p>
                            </td>
                            <td className="px-6 py-6">
                               <div className="flex flex-col gap-1.5">
                                  <span className={`w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${deal.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                     {deal.status}
                                  </span>
                                  <span className={`w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${deal.depositStatus === 'Refunded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                     {deal.depositStatus}
                                  </span>
                               </div>
                            </td>
                            <td className="px-6 py-6 text-right">
                               <p className="text-lg font-black text-slate-900 m-0">₹{deal.totalPrice.toLocaleString('en-IN')}</p>
                               <p className="text-[10px] text-slate-400 font-bold m-0">+ ₹{(deal.depositAmount || 0).toLocaleString('en-IN')} Dep.</p>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex justify-end gap-2">
                                  <Link to={`/invoice/${deal._id}`} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm">
                                     <Download size={18} />
                                  </Link>
                                  {deal.depositStatus === 'Held' && (
                                    <button 
                                      onClick={() => refundDeposit(deal._id)} 
                                      className="h-10 px-4 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all border border-amber-100"
                                    >
                                      Refund Deposit
                                    </button>
                                  )}
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
             )}
          </div>
        </section>

        {/* My Listed Items Section (Gallery Style) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-primary rounded-full"></div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Marketplace <span className="text-slate-400">Inventory</span></h2>
            </div>
            <Link to="/add-item" className="text-sm font-black text-primary hover:underline flex items-center gap-2">Add Items <ArrowRight size={16}/></Link>
          </div>
          
          {data.myItems.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] py-16 text-center">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No listings found. Start your empire today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {data.myItems.map(item => (
                 <div key={item._id} className="group relative bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="aspect-video bg-[#f8faff] p-6 relative">
                       {item.imageFilename ? (
                         <img src={getImageUrl(item.imageFilename)} alt={item.name} className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-700" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-200 uppercase text-[10px] font-black">No Image</div>
                       )}
                       <div className="absolute top-4 right-4 flex items-center gap-1.5">
                          <Link to={`/edit-item/${item._id}`} className="w-8 h-8 rounded-lg bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                             <Edit size={14} />
                          </Link>
                          <button onClick={() => deleteItem(item._id)} className="w-8 h-8 rounded-lg bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                    <div className="p-6">
                       <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-black text-slate-900 truncate">
                             <Link to={`/item/${item._id}`} className="hover:text-primary transition-colors">{item.name}</Link>
                          </h4>
                       </div>
                       <div className="flex justify-between items-center mb-6">
                          <span className="text-xl font-black text-slate-900">₹{item.rentalPrice.toLocaleString('en-IN')}</span>
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                             {item.isAvailable ? 'Live' : 'Hidden'}
                          </span>
                       </div>
                       <button 
                         onClick={() => toggleAvailability(item._id)} 
                         className="w-full btn btn-outline border-slate-100 py-3 rounded-xl flex items-center justify-center gap-2 text-xs hover:bg-slate-900 hover:text-white transition-all transform active:scale-95"
                       >
                         <RefreshCw size={14} /> Toggle Visibility
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
