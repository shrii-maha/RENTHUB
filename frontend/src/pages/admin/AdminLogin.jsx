import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, true); // true sets isAdminLogin flag
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-md pt-8">
      <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
        <div className="text-center mb-6">
          <div className="inline-flex justify-center items-center bg-slate-100 text-primary rounded-full p-4 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2>Admin Portal</h2>
          <p className="text-muted">Enter administrative credentials</p>
        </div>

        {error && <div className="p-3 mb-4 badge-danger rounded text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
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
            {loading ? 'Verifying...' : 'Login as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
