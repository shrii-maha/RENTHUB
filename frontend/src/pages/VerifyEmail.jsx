import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // "verifying" | "success" | "error"
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link. Please register again.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.message || 'Verification failed. The link may have expired.'
        );
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="fade-in min-h-screen flex items-center justify-center py-12">
      <div className="card max-w-md w-full text-center p-12">

        {status === 'verifying' && (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 
                size={64} 
                className="text-indigo-500 animate-spin"
              />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Verifying your email...</h2>
            <p className="text-slate-500">Please wait a moment while we confirm your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-100 text-emerald-600 w-24 h-24 rounded-full flex items-center justify-center animate-bounce">
                <ShieldCheck size={48} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-emerald-700 mb-3">Email Verified! 🎉</h2>
            <p className="text-slate-500 mb-6">{message}</p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 mb-6">
              <p className="text-emerald-600 text-sm font-medium">Redirecting you to login in 3 seconds...</p>
            </div>
            <Link to="/login" className="btn btn-primary btn-block py-3">
              Log In Now →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-rose-100 text-rose-600 w-24 h-24 rounded-full flex items-center justify-center">
                <AlertCircle size={48} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-rose-700 mb-3">Verification Failed</h2>
            <p className="text-slate-500 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link to="/register" className="btn btn-primary btn-block py-3">
                Register Again
              </Link>
              <Link to="/contact" className="btn btn-outline btn-block py-2">
                Contact Support
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
