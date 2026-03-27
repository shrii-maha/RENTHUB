import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { UserPlus, ShieldPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(res.data.email)}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-2xl mx-auto pt-12 pb-12">
      <div className="card shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex justify-center items-center bg-primary text-white rounded-full p-4 mb-4 shadow-xl shadow-primary/20">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-muted">Join the RentHub marketplace community</p>
        </div>

        {error && <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl mb-6 text-sm font-bold opacity-0 fade-in">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-control" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input type="text" className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Address *</label>
              <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength="6" />
            </div>

            <div className="md:col-span-2 mt-10 mb-6 border-b pb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ShieldPlus size={20} className="text-secondary" /> Payment Setup <span className="text-xs text-muted font-normal">(Optional)</span>
              </h3>
              <p className="text-xs text-muted font-medium mb-4">Required only if you plan to list your high-end gear for rent.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input type="text" className="form-control" name="bankName" value={formData.bankName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Holder Name</label>
                  <input type="text" className="form-control" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input type="text" className="form-control" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input type="text" className="form-control" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 mt-8">
              <button type="submit" className="btn btn-primary btn-block py-4 text-xl font-bold shadow-xl shadow-primary/40 transform active:scale-[0.98]" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up Free'}
              </button>
            </div>
          </div>
        </form>

        <p className="text-center mt-10 text-muted text-sm">
          Already have an account? <Link to="/login" className="text-primary font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
