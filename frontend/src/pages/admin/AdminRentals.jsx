import { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import AdminNav from '../../components/AdminNav';
import { Download, Eye } from 'lucide-react';

const AdminRentals = () => {
  const { user } = useContext(AuthContext);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRentals = async () => {
    try {
      const res = await api.get('/admin/rentals');
      setRentals(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/admin/rentals/${id}/status`, { status });
      fetchRentals();
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating status');
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchRentals();
    }
  }, [user]);

  if (!user || (!user.isAdmin)) return <Navigate to="/" />;

  return (
    <div className="fade-in py-4">
      <h1 className="mb-2">Manage Bookings</h1>
      <p className="text-muted mb-8">View and manage all platform transactions and deals.</p>
      
      <AdminNav />

      {loading ? (
        <div className="text-center py-12">Loading bookings...</div>
      ) : rentals.length === 0 ? (
        <div className="card text-center py-8 text-muted">No bookings found.</div>
      ) : (
        <div className="card overflow-hidden" style={{ overflowX: 'auto' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm uppercase text-muted tracking-wider">
                <th className="py-2">Date</th>
                <th className="py-2">Item</th>
                <th className="py-2">Renter</th>
                <th className="py-2">Owner</th>
                <th className="py-2">Total Price</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-center">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(r => (
                <tr key={r._id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="font-medium text-primary">{r.item?.name}</div>
                    <div className="text-xs text-muted">ID: {r._id.slice(-6).toUpperCase()}</div>
                  </td>
                  <td className="py-3">
                    <div className="font-bold">{r.renter?.fullName}</div>
                    <div className="text-xs text-muted">{r.renter?.email}</div>
                  </td>
                  <td className="py-3">
                    <div className="font-bold">{r.item?.owner?.fullName}</div>
                    <div className="text-xs text-muted">{r.item?.owner?.email}</div>
                  </td>
                  <td className="py-3 font-bold text-slate-700">₹{r.totalPrice}</td>
                  <td className="py-3">
                    <span className={`badge ${r.status === 'Active' ? 'badge-success' : r.status === 'Pending' ? 'badge-warning' : 'badge-info'}`}>
                      {r.status}
                    </span>
                  </td>
                   <td className="py-3 text-center flex flex-col gap-1 items-center">
                     {r.status === 'Pending' && (
                       <div className="flex gap-1 mb-1">
                         <button 
                           onClick={() => handleStatusUpdate(r._id, 'Approved')}
                           className="btn btn-secondary text-xs px-2 py-1"
                         >
                           Approve
                         </button>
                         <button 
                           onClick={() => handleStatusUpdate(r._id, 'Rejected')}
                           className="btn btn-danger text-xs px-2 py-1"
                         >
                           Reject
                         </button>
                       </div>
                     )}
                     <Link 
                       to={`/invoice/${r._id}`} 
                       className="btn btn-outline text-xs py-1 px-2 flex items-center justify-center gap-1"
                       style={{ maxWidth: '80px', width: '100%' }}
                     >
                       <Download size={12} /> Bill
                     </Link>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRentals;
