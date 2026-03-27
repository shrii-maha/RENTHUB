import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Loader2, ArrowRight, FileText } from 'lucide-react';

const PaymentSuccess = () => {
  const { rentalId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !rentalId) {
        setStatus('error');
        setError('Missing payment information');
        return;
      }
      try {
        await api.post(`/payments/success/${rentalId}`, { session_id: sessionId });
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.error || 'Failed to verify payment');
      }
    };
    verifyPayment();
  }, [rentalId, sessionId]);

  // Auto-redirect to invoice after countdown
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) { navigate(`/invoice/${rentalId}`); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, navigate, rentalId]);

  return (
    <div className="fade-in min-h-[60vh] flex items-center justify-center">
      <div className="card max-w-md w-full text-center p-12 shadow-2xl">

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary" size={64} />
            <h2 className="text-2xl">Verifying Payment...</h2>
            <p className="text-muted">Please wait while we confirm your transaction with Stripe.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-2">
              <CheckCircle size={64} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Payment Successful! 🎉</h2>
            <p className="text-slate-500">Your rental is now <strong>active</strong>. Your invoice is loading automatically.</p>

            {/* Animated countdown ring */}
            <div className="relative w-16 h-16 my-2">
              <svg className="w-16 h-16" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e0e7ff" strokeWidth="6" />
                <circle
                  cx="32" cy="32" r="28" fill="none" stroke="#6366f1" strokeWidth="6"
                  strokeDasharray={`${(countdown / 4) * 176} 176`}
                  style={{ transition: 'stroke-dasharray 0.9s linear' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-bold text-primary text-xl">{countdown}</span>
            </div>
            <p className="text-sm text-muted">Redirecting to your invoice in {countdown}s...</p>

            <div className="mt-4 flex flex-col gap-3 w-full">
              <Link to={`/invoice/${rentalId}`} className="btn btn-primary btn-block flex items-center justify-center gap-2">
                <FileText size={18} /> View Invoice Now
              </Link>
              <Link to="/my-rentals" className="btn btn-outline btn-block flex items-center justify-center gap-2">
                Go to My Rentals <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-rose-100 text-rose-600 p-4 rounded-full mb-2">
              <XCircle size={64} />
            </div>
            <h2 className="text-2xl font-bold">Oops! Verification Failed</h2>
            <p className="text-rose-600 font-medium">{error}</p>
            <p className="text-muted text-sm px-4">If you believe this is an error and your payment was successful, please contact support.</p>
            <div className="mt-8 flex flex-col gap-3 w-full">
              <Link to="/my-rentals" className="btn btn-primary btn-block">Back to My Rentals</Link>
              <Link to="/contact" className="btn btn-outline btn-block">Contact Support</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentSuccess;
