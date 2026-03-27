import { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import AdminNav from '../../components/AdminNav';
import { Users, Package, RefreshCw, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.isAdmin) {
      api.get('/admin/stats')
        .then(res => {
          setStats(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user || (!user.isAdmin)) return <Navigate to="/" />;
  if (loading) return <div className="text-center py-12">Loading Admin Dashboard...</div>;

  return (
    <div className="fade-in py-4">
      <h1 className="mb-2">Admin Dashboard</h1>
      <p className="text-muted mb-8">Platform overview and management.</p>
      
      <AdminNav />

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card text-center justify-center flex flex-col border-t-4 border-blue-500">
            <div className="text-blue-500 mb-2 flex justify-center"><Users size={32} /></div>
            <h2>{stats.totalUsers}</h2>
            <p className="text-muted uppercase text-sm font-bold tracking-wider">Total Users</p>
          </div>
          
          <div className="card text-center justify-center flex flex-col border-t-4 border-emerald-500">
            <div className="text-emerald-500 mb-2 flex justify-center"><Package size={32} /></div>
            <h2>{stats.totalItems}</h2>
            <p className="text-muted uppercase text-sm font-bold tracking-wider">Total Items Listed</p>
          </div>
          
          <div className="card text-center justify-center flex flex-col border-t-4 border-amber-500">
            <div className="text-amber-500 mb-2 flex justify-center"><RefreshCw size={32} /></div>
            <h2>{stats.totalRentals}</h2>
            <p className="text-muted uppercase text-sm font-bold tracking-wider">Total Rentals</p>
          </div>
          
          <div className="card text-center justify-center flex flex-col border-t-4 border-purple-500">
            <div className="text-purple-500 mb-2 flex justify-center"><DollarSign size={32} /></div>
            <h2>₹{stats.totalRevenue.toLocaleString()}</h2>
            <p className="text-muted uppercase text-sm font-bold tracking-wider">Platform Volume</p>
          </div>
        </div>
      )}

      <div className="card bg-slate-50 border-0">
        <h3>Platform Status</h3>
        <p className="text-muted m-0">The RentHub platform is running smoothly. Use the navigation above to manage users and items.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
