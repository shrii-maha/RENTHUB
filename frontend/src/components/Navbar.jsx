import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { Package, Menu, X, User as UserIcon, LogOut, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <Package size={28} />
          RentHub
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/items" className="nav-link">Browse Items</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>

          <button 
            onClick={toggleTheme} 
            className="btn btn-outline" 
            style={{ padding: '0.5rem', borderRadius: '50%', minWidth: '40px', height: '40px' }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <>
              {user.isAdmin ? (
                <Link to="/admin/dashboard" className="btn btn-outline">Admin Panel</Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/dashboard" className="nav-link flex items-center gap-1">
                    <UserIcon size={18} /> Dashboard
                  </Link>
                  <Link to="/my-rentals" className="nav-link">My Rentals</Link>
                  <Link to="/add-item" className="btn btn-primary">List Item</Link>
                </div>
              )}
              <button onClick={onLogout} className="btn btn-outline flex items-center gap-1">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="mobile-menu-btn" style={{ display: 'none' }} onClick={toggleMenu}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-nav" style={{
          position: 'absolute', top: '80px', left: 0, right: 0, 
          background: 'var(--card-bg)', backdropFilter: 'blur(16px)', 
          borderBottom: 'var(--glass-border)', padding: '1rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <Link to="/" className="nav-link" onClick={toggleMenu}>Home</Link>
          <Link to="/items" className="nav-link" onClick={toggleMenu}>Browse Items</Link>
          
          <div className="flex items-center justify-between border-t border-b py-2 my-1" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <span className="text-sm font-medium">Appearance</span>
            <button 
              onClick={toggleTheme} 
              className="btn btn-outline" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              {theme === 'dark' ? <><Sun size={16} /> Light</> : <><Moon size={16} /> Dark</>}
            </button>
          </div>

          {user ? (
            <>
              {user.isAdmin ? (
                <Link to="/admin/dashboard" className="nav-link" onClick={toggleMenu}>Admin Panel</Link>
              ) : (
                <>
                  <Link to="/dashboard" className="nav-link" onClick={toggleMenu}>Dashboard</Link>
                  <Link to="/my-rentals" className="nav-link" onClick={toggleMenu}>My Rentals</Link>
                  <Link to="/add-item" className="nav-link font-bold text-primary" onClick={toggleMenu}>List Item</Link>
                </>
              )}
              <button onClick={onLogout} className="nav-link text-left text-danger" style={{ background: 'none', border: 'none', padding: 0, fontSize: '1rem' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={toggleMenu}>Login</Link>
              <Link to="/register" className="nav-link font-bold text-primary" onClick={toggleMenu}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
