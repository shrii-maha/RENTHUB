import { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import AdminNav from '../../components/AdminNav';
import { Trash2 } from 'lucide-react';

const AdminUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchUsers();
    }
  }, [user]);

  if (!user || (!user.isAdmin)) return <Navigate to="/" />;

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure? This will delete the user and all their associated items, rentals, and reviews.")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="fade-in py-4">
      <h1 className="mb-2">Manage Users</h1>
      <p className="text-muted mb-8">View and remove platform users.</p>
      
      <AdminNav />

      {loading ? (
        <div className="text-center py-12">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="card text-center py-8 text-muted">No users found.</div>
      ) : (
        <div className="card overflow-hidden" style={{ overflowX: 'auto' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Joined</th>
                <th className="py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b hover:bg-slate-50">
                  <td className="py-3 font-medium">{u.fullName}</td>
                  <td className="py-3 text-muted">{u.email}</td>
                  <td className="py-3">{u.phoneNumber}</td>
                  <td className="py-3 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-center">
                    <button onClick={() => handleDelete(u._id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} title="Delete User">
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

export default AdminUsers;
