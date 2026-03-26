import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Loader2, ArrowRight, FileText } from 'lucide-react';

const PaymentSuccess = () => {
  const { rentalId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [error, setError] = useState('');

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
            <p className="text-slate-500">Your rental is now <strong>active</strong>. Your invoice is ready to view and print below.</p>
            
            <div className="mt-8 flex flex-col gap-3 w-full">
              <Link to={`/invoice/${rentalId}`} className="btn btn-primary btn-block flex items-center justify-center gap-2">
                <FileText size={18} /> View Your Invoice
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
              <Link to="/my-rentals" className="btn btn-primary btn-block">
                Back to My Rentals
              </Link>
              <Link to="/contact" className="btn btn-outline btn-block">
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
