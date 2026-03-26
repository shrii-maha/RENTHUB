import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(res.data.message);
      
      // Delay navigation slightly so they can read the success message
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="card w-full max-w-md">
        <h2 className="text-center mb-6">Forgot Password</h2>
        <p className="text-center text-muted mb-6">Enter your email address and we will send you a 6-digit verification code to reset your password.</p>
        
        {error && <div className="badge-danger p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="badge-success p-3 rounded mb-4 text-sm">{success}</div>}
        
        <form onSubmit={handleRequestOTP}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block text-lg py-3 mt-4"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Recovery Code'}
          </button>
        </form>
        
        <div className="text-center mt-6 border-t pt-4">
          <Link to="/login" className="text-primary hover:underline">Return to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
