import { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import AdminNav from '../../components/AdminNav';
import { Trash2, ExternalLink } from 'lucide-react';

const AdminItems = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await api.get('/admin/items');
      setItems(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchItems();
    }
  }, [user]);

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure? This will delete the item and all associated rentals and reviews.")) {
      try {
        await api.delete(`/items/${itemId}`); // The backend item delete route handles admin logic
        fetchItems();
      } catch (err) {
        alert(err.response?.data?.error || 'Error deleting item');
      }
    }
  };

  if (!user || (!user.isAdmin)) return <Navigate to="/" />;

  return (
    <div className="fade-in py-4">
      <h1 className="mb-2">Manage Items</h1>
      <p className="text-muted mb-8">View and remove all listed items.</p>
      
      <AdminNav />

      {loading ? (
        <div className="text-center py-12">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="card text-center py-8 text-muted">No items found.</div>
      ) : (
        <div className="card overflow-hidden" style={{ overflowX: 'auto' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Item</th>
                <th className="py-2">Category</th>
                <th className="py-2">Owner</th>
                <th className="py-2">Price</th>
                <th className="py-2 text-center">Status</th>
                <th className="py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i._id} className="border-b hover:bg-slate-50">
                  <td className="py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <Link to={`/item/${i._id}`} className="flex items-center gap-1">
                        {i.name} <ExternalLink size={14} className="text-muted" />
                      </Link>
                    </div>
                  </td>
                  <td className="py-3 capitalize">{i.category}</td>
                  <td className="py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{i.owner?.fullName || 'Deleted User'}</span>
                      <span className="text-xs text-muted">{i.owner?.email || ''}</span>
                    </div>
                  </td>
                  <td className="py-3">₹{i.rentalPrice}/day</td>
                  <td className="py-3 text-center">
                    <span className={`badge ${i.isAvailable ? 'badge-success' : 'badge-warning'}`}>
                      {i.isAvailable ? 'Avail' : 'Rented'}
                    </span>
                  </td>
                  <td className="py-3 flex gap-2 justify-center">
                    <button onClick={() => handleDelete(i._id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} title="Delete Item">
                      <Trash2 size={16} />
                    </button>
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

export default AdminItems;
