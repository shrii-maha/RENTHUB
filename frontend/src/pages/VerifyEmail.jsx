import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { ShieldCheck, Loader2, RefreshCw, ArrowLeft, Mail } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const emailParam = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!emailParam) {
      navigate('/login');
    }
  }, [emailParam, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleInput = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only numbers
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) return setError('Please enter all 6 digits');

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/verify-email', { email: emailParam, otp: otpCode });
      
      // Verification successful - user is now logged in (token set in localStorage by backend response)
      setSuccess(true);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResending(true);
    setError('');
    try {
      await api.post('/auth/resend-otp', { email: emailParam });
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="fade-in min-h-[60vh] flex items-center justify-center">
        <div className="card max-w-md w-full text-center p-12">
          <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Verified!</h2>
          <p className="text-muted mt-2">Your email has been successfully verified.</p>
          <p className="text-primary font-bold mt-4">Redirecting you to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-md mx-auto pt-12">
      <div className="card">
        <div className="mb-8 text-center">
          <div className="inline-flex justify-center items-center bg-indigo-50 text-indigo-600 rounded-2xl p-4 mb-4">
            <Mail size={32} />
          </div>
          <h1>Check your Email</h1>
          <p className="text-muted">We've sent a 6-digit code to <br /><b>{emailParam}</b></p>
        </div>

        {error && <div className="p-3 mb-6 badge-danger rounded text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2 mb-8">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength="1"
                className="form-control text-center text-3xl font-bold h-16 w-full p-0"
                value={digit}
                onChange={(e) => handleInput(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block text-lg py-3 flex items-center justify-center gap-2" 
            disabled={loading || otp.includes('')}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Verify Account'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-muted mb-2">Didn't receive the code?</p>
          <button 
            onClick={resendOtp} 
            disabled={timer > 0 || resending}
            className={`flex items-center gap-2 mx-auto font-bold ${timer > 0 ? 'text-slate-400' : 'text-primary'}`}
          >
            {resending ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
          </button>
        </div>

        <Link to="/login" className="flex items-center justify-center gap-2 text-muted mt-6 hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
