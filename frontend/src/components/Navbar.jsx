import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { Package, Menu, X, User as UserIcon, LogOut, Sun, Moon, PlusCircle } from 'lucide-react';

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
        <Link to="/" className="nav-brand flex-shrink-0">
          <Package size={28} style={{ color: '#6366f1' }} />
          <span>RentHub</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/items" className="nav-link">Browse Items</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>

          <div className="flex items-center gap-6 ml-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} className="text-slate-600" /> : <Sun size={20} className="text-amber-400" />}
            </button>

            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className="nav-link flex items-center gap-2">
                  <UserIcon size={18} /> Dashboard
                </Link>
                <Link to="/my-rentals" className="nav-link">My Rentals</Link>
                <Link to="/add-item" className="btn btn-primary px-6" style={{ height: '44px' }}>
                  List Item
                </Link>
                <button onClick={onLogout} className="text-slate-500 hover:text-rose-500 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary px-8" style={{ height: '44px' }}>Sign Up</Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={toggleMenu} className="text-slate-600">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[80px] left-0 right-0 bg-white border-b shadow-2xl p-8 flex flex-col gap-4 fade-in z-[3000] dark:bg-slate-900 dark:border-slate-800">
          <Link to="/" className="nav-link py-3 font-bold text-lg border-b border-slate-50 dark:border-slate-800" onClick={toggleMenu}>Home</Link>
          <Link to="/items" className="nav-link py-3 font-bold text-lg border-b border-slate-50 dark:border-slate-800" onClick={toggleMenu}>Browse Items</Link>
          <Link to="/about" className="nav-link py-3 font-bold text-lg border-b border-slate-50 dark:border-slate-800" onClick={toggleMenu}>About</Link>
          <Link to="/contact" className="nav-link py-3 font-bold text-lg border-b border-slate-50 dark:border-slate-800" onClick={toggleMenu}>Contact</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link py-2" onClick={toggleMenu}>Dashboard</Link>
              <Link to="/my-rentals" className="nav-link py-2" onClick={toggleMenu}>My Rentals</Link>
              <Link to="/add-item" className="btn btn-primary py-3" onClick={toggleMenu}>List New Item</Link>
              <button onClick={onLogout} className="btn btn-outline py-3 text-rose-500 border-rose-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link py-2" onClick={toggleMenu}>Login</Link>
              <Link to="/register" className="btn btn-primary py-3" onClick={toggleMenu}>Sign Up Free</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
