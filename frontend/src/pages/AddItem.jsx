import { useState, useContext } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { PackagePlus } from 'lucide-react';

const AddItem = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    rentalPrice: '',
    isAvailable: 'true'
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/login" />;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = new FormData();
    for (const key in formData) {
      submitData.append(key, formData[key]);
    }
    if (image) {
      submitData.append('image', image);
    }

    try {
      await api.post('/items', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to list item');
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-2xl pt-8 pb-12">
      <div className="card">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-3 rounded-full">
              <PackagePlus size={24} />
            </div>
            <h2 style={{ margin: 0 }}>List a New Item</h2>
          </div>
          <Link to="/dashboard" className="btn btn-outline text-sm">Cancel</Link>
        </div>

        {error && <div className="p-3 mb-4 badge-danger rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="form-group col-span-2">
            <label className="form-label">Item Name</label>
            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
          </div>

          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Category</label>
            <select className="form-control" name="category" value={formData.category} onChange={handleChange} required>
              <option value="electronics">Electronics</option>
              <option value="vehicles">Vehicles</option>
              <option value="tools">Tools</option>
              <option value="party">Party Supplies</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Rental Price (₹ per day)</label>
            <input type="number" className="form-control" name="rentalPrice" value={formData.rentalPrice} onChange={handleChange} required min="1" step="0.01" />
          </div>

          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Image</label>
            <input type="file" className="form-control" accept="image/jpeg, image/png, image/jpg" onChange={handleFileChange} />
          </div>

          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Availability</label>
            <div className="flex items-center h-full">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isAvailable" checked={formData.isAvailable === 'true'} onChange={(e) => setFormData({...formData, isAvailable: e.target.checked ? 'true' : 'false'})} />
                <span className="font-medium">Available for rent immediately</span>
              </label>
            </div>
          </div>

          <div className="col-span-2 mt-4 pt-4 border-t">
            <button type="submit" className="btn btn-primary btn-block text-lg py-3" disabled={loading}>
              {loading ? 'Posting Item...' : 'Post Item for Rent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
