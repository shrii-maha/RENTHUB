import { useState, useContext, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { ShieldCheck, Mail, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user && user.isVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user) return <Navigate to="/login" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/auth/verify-otp', { otp });
      setUser({ ...user, isVerified: true });
      setMessage('Email verified successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setMessage('');

    try {
      await api.post('/auth/resend-otp');
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fade-in max-w-md mx-auto pt-12 pb-12">
      <div className="card text-center">
        <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={32} />
        </div>
        
        <h1 className="mb-2">Verify Your Email</h1>
        <p className="text-muted mb-8">
          We've sent a 6-digit verification code to <span className="font-bold text-dark">{user.email}</span>. 
          Please enter it below to complete your registration.
        </p>

        {error && <div className="badge-danger p-3 rounded mb-4 text-sm">{error}</div>}
        {message && <div className="badge-success p-3 rounded mb-4 text-sm bg-emerald-100 text-emerald-800 border border-emerald-200">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <input 
              type="text" 
              className="form-control text-center text-2xl font-bold tracking-widest py-3" 
              placeholder="000000"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block py-3 text-lg flex items-center justify-center gap-2"
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t">
          <p className="text-muted text-sm mb-2">Didn't receive the code?</p>
          <button 
            onClick={handleResend} 
            className="btn btn-outline btn-sm flex items-center gap-2 mx-auto"
            disabled={resending || loading}
          >
            {resending ? <RefreshCw size={16} className="animate-spin" /> : <Mail size={16} />}
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </div>
      
      <p className="text-center mt-6 text-sm text-muted">
        Need help? <a href="/contact" className="text-primary font-medium">Contact Support</a>
      </p>
    </div>
  );
};

export default VerifyEmail;
