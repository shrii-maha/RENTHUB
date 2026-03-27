import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogIn, ShieldAlert } from 'lucide-react';

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
      const message = errorData?.error || 'Login failed. Invalid credentials.';
      setError(message);

      if (errorData?.requiresVerification) {
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(errorData.email)}`);
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-md mx-auto pt-16">
      <div className="card shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center bg-primary text-white rounded-full p-4 mb-4 shadow-xl shadow-primary/20">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-muted">Sign in to your RentHub marketplace account</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl mb-6 flex items-center gap-3">
            <ShieldAlert size={20} />
            <p className="text-sm font-bold">{error}</p>
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
              style={{ borderRadius: '12px' }}
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
              style={{ borderRadius: '12px' }}
            />
          </div>

          <div className="flex justify-end mb-6">
            <Link to="/forgot-password" title="Forgot Password?" className="text-secondary text-xs font-bold uppercase tracking-widest hover:text-secondary-hover">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block py-4 text-lg font-bold shadow-xl shadow-primary/20 transform active:scale-95 transition-all" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-muted text-sm">Don't have an account? <Link to="/register" className="text-primary font-bold">Sign Up Free</Link></p>
          <div className="mt-8 pt-6 border-t border-slate-100 opacity-60 hover:opacity-100 transition-opacity">
            <Link to="/admin/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-primary">
              Restricted Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
