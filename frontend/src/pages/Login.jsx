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
      await login(email, password, false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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

        {error && <div className="p-3 mb-4 badge-danger rounded text-center">{error}</div>}

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
          <button type="submit" className="btn btn-primary btn-block mt-4" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-muted">
          Don't have an account? <Link to="/register" className="text-primary font-bold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
