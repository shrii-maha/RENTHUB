import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill email if passed from ForgotPassword view
  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess(res.data.message);
      
      // Navigate to login after successful reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="card w-full max-w-md">
        <h2 className="text-center mb-6">Reset Password</h2>
        <p className="text-center text-muted mb-6">Enter the 6-digit code sent to your email to create a new password.</p>
        
        {error && <div className="badge-danger p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="badge-success p-3 rounded mb-4 text-sm">{success}</div>}
        
        <form onSubmit={handleReset}>
          <div className="form-group mb-4">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label block text-center">6-Digit Recovery Code</label>
            <input 
              type="text" 
              className="form-control text-center text-2xl tracking-widest font-bold font-mono"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only numbers
              placeholder="000000"
              required 
            />
          </div>
          
          <div className="form-group mb-4">
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="At least 6 characters"
              required 
            />
          </div>

          <div className="form-group mb-6">
            <label className="form-label">Confirm New Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block text-lg py-3"
            disabled={loading}
          >
            {loading ? 'Resetting Password...' : 'Save New Password'}
          </button>
        </form>
        
        <div className="text-center mt-6 border-t pt-4">
          <Link to="/forgot-password" className="text-muted hover:text-primary text-sm mr-4">Didn't get code?</Link>
          <Link to="/login" className="text-primary hover:underline font-medium">Return to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
