import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Save, ChevronLeft, Package, Image as ImageIcon } from 'lucide-react';

const EditItem = () => {
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
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        const item = res.data.data.item;
        
        // Security check: Only owner can edit (Admin should use AdminEditItem, but we allow here too)
        if (item.owner._id !== user.id && !user.isAdmin) {
          setError('You are not authorized to edit this item');
          setLoading(false);
          return;
        }

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

    if (user) {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('rentalPrice', formData.rentalPrice);
    data.append('depositAmount', formData.depositAmount);
    data.append('isAvailable', formData.isAvailable);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await api.put(`/items/${id}`, data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update item');
      setSaving(false);
    }
  };

  if (!user) return <Navigate to="/login" />;
  if (loading) return <div className="text-center py-12">Loading item details...</div>;

  return (
    <div className="fade-in py-4 max-w-2xl mx-auto">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-muted hover:text-primary mb-6 transition-colors"
      >
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <div className="card shadow-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl mb-0">Edit Your Item</h1>
            <p className="text-muted text-sm">Update your listing information</p>
          </div>
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-lg text-center">{error}</div>}

        {!error && (
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="form-group">
              <label className="form-label font-bold text-sm">Item Name</label>
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
                <label className="form-label font-bold text-sm">Category</label>
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
                <label className="form-label font-bold text-sm">Status</label>
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox" 
                    name="isAvailable"
                    className="w-5 h-5 accent-primary cursor-pointer"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                  />
                  <span className={formData.isAvailable ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                    {formData.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label font-bold text-sm">Daily Rent (₹)</label>
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
                <label className="form-label font-bold text-sm">Security Deposit (₹)</label>
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
              <label className="form-label font-bold text-sm">Description</label>
              <textarea 
                name="description"
                className="form-control" 
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-group pb-4">
              <label className="form-label font-bold text-sm">Item Image</label>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-24 h-24 rounded-lg bg-slate-100 border-2 border-dashed flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-muted" size={24} />
                  )}
                </div>
                <div className="flex-grow">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20 cursor-pointer"
                  />
                  <p className="text-[10px] text-muted mt-1">Upload a new image to replace the existing one.</p>
                </div>
              </div>
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
                onClick={() => navigate('/dashboard')}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditItem;
