import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const errorData = err.response?.data;
      const message = errorData?.error || 'Login failed. Please try again.';
      setError(message);

      // If the user isn't verified, redirect to verification page
      if (errorData?.requiresVerification) {
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(errorData.email)}`);
        }, 2000);
      }

      // If the server says the user doesn't exist, redirect to register after 2s
      if (errorData?.shouldSignUp) {
        setTimeout(() => navigate(`/register`), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-md pt-8">
      <div className="card">
        <div className="text-center mb-6">
          <div className="inline-flex justify-center items-center bg-primary text-white rounded-full p-4 mb-4">
            <LogIn size={32} />
          </div>
          <h2>Welcome Back</h2>
          <p className="text-muted">Sign in to your RentHub account</p>
        </div>

        {error && (
          <div className="p-3 mb-4 badge-danger rounded text-center">
            <p>{error}</p>
            {error.includes('sign up') && (
              <p className="mt-2 text-sm">
                Redirecting to <Link to="/register" className="font-bold underline">Sign Up</Link>...
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <div className="flex justify-end mb-4">
            <Link to="/forgot-password" className="text-secondary text-sm font-medium hover:underline">Forgot Password?</Link>
          </div>

          <div className="flex flex-col gap-4">
            <button type="submit" className="btn btn-primary btn-block text-lg py-3" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-muted">Don't have an account? <Link to="/register" className="font-bold">Sign Up</Link></p>
          <div className="mt-8 pt-4 border-t border-slate-100 opacity-50 hover:opacity-100 transition-opacity">
            <Link to="/admin/login" className="text-xs uppercase tracking-widest text-muted hover:text-primary">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
