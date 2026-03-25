import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

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
      await register(formData);
      navigate('/verify-phone');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-2xl pt-8 pb-12">
      <div className="card">
        <div className="text-center mb-6">
          <div className="inline-flex justify-center items-center bg-primary text-white rounded-full p-4 mb-4">
            <UserPlus size={32} />
          </div>
          <h2>Create an Account</h2>
          <p className="text-muted">Start renting and listing items today</p>
        </div>

        {error && <div className="p-3 mb-4 badge-danger rounded text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Full Name *</label>
            <input type="text" className="form-control" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>
          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Email Address *</label>
            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Phone Number *</label>
            <input type="text" className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          </div>
          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Address *</label>
            <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Password *</label>
            <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
          </div>
          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Confirm Password *</label>
            <input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength="6" />
          </div>

          <div className="col-span-2 mt-4 mb-2 border-b pb-2">
            <h3 className="text-xl">Bank Details (Optional)</h3>
            <p className="text-sm text-muted">Required if you plan to list items for rent.</p>
          </div>

          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Bank Name</label>
            <input type="text" className="form-control" name="bankName" value={formData.bankName} onChange={handleChange} />
          </div>
          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Account Holder Name</label>
            <input type="text" className="form-control" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} />
          </div>
          
          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">Account Number</label>
            <input type="text" className="form-control" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
          </div>
          <div className="form-group col-span-2 sm:col-span-1">
            <label className="form-label">IFSC Code</label>
            <input type="text" className="form-control" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
          </div>

          <div className="col-span-2 mt-4">
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-muted">
          Already have an account? <Link to="/login" className="text-primary font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
