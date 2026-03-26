import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import api from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import { Save, ChevronLeft, Package } from 'lucide-react';

const AdminEditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    rentalPrice: '',
    depositAmount: '',
    isAvailable: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        const item = res.data.data;
        setFormData({
          name: item.name || '',
          description: item.description || '',
          category: item.category || '',
          rentalPrice: item.rentalPrice || '',
          depositAmount: item.depositAmount || '',
          isAvailable: item.isAvailable
        });
        setLoading(false);
      } catch (err) {
        setError('Could not fetch item details');
        setLoading(false);
      }
    };

    if (user && user.isAdmin) {
      fetchItem();
    }
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.put(`/admin/items/${id}`, formData);
      navigate('/admin/items');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update item');
      setSaving(false);
    }
  };

  if (!user || !user.isAdmin) return <Navigate to="/" />;
  if (loading) return <div className="text-center py-12">Loading item details...</div>;

  return (
    <div className="fade-in py-4 max-w-2xl mx-auto">
      <button 
        onClick={() => navigate('/admin/items')}
        className="flex items-center gap-2 text-muted hover:text-primary mb-6 transition-colors"
      >
        <ChevronLeft size={20} /> Back to Inventory
      </button>

      <div className="card shadow-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl mb-0">Edit Item Details</h1>
            <p className="text-muted text-sm">Update product information as Administrator</p>
          </div>
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input 
              type="text" 
              name="name"
              className="form-control" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                name="category"
                className="form-control" 
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="electronics">Electronics</option>
                <option value="vehicles">Vehicles</option>
                <option value="tools">Tools</option>
                <option value="party">Party Supplies</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  name="isAvailable"
                  className="w-5 h-5 accent-primary"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                />
                <span className={formData.isAvailable ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                  {formData.isAvailable ? 'Available for Rent' : 'Marked as Rented/Unavailable'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Daily Rent (₹)</label>
              <input 
                type="number" 
                name="rentalPrice"
                className="form-control" 
                value={formData.rentalPrice}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Security Deposit (₹)</label>
              <input 
                type="number" 
                name="depositAmount"
                className="form-control" 
                value={formData.depositAmount}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              name="description"
              className="form-control" 
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="pt-4 border-t flex gap-4">
            <button 
              type="submit" 
              className="btn btn-primary flex-grow gap-2"
              disabled={saving}
            >
              <Save size={20} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button"
              onClick={() => navigate('/admin/items')}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditItem;
