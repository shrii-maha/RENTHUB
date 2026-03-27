import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddItem from './pages/AddItem';
import MyRentals from './pages/MyRentals';
import EditItem from './pages/EditItem';
import About from './pages/About';
import Contact from './pages/Contact';
import Invoice from './pages/Invoice';
import PaymentSuccess from './pages/PaymentSuccess';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminItems from './pages/admin/AdminItems';
import AdminRentals from './pages/admin/AdminRentals';
import AdminEditItem from './pages/admin/AdminEditItem';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/items" element={<Items />} />
                <Route path="/item/:id" element={<ItemDetail />} />

                {/* Auth Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected User Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/add-item" element={<AddItem />} />
                <Route path="/my-rentals" element={<MyRentals />} />
                <Route path="/edit-item/:id" element={<EditItem />} />
                <Route path="/invoice/:id" element={<Invoice />} />
                <Route path="/payment-success/:rentalId" element={<PaymentSuccess />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/items" element={<AdminItems />} />
                <Route path="/admin/rentals" element={<AdminRentals />} />
                <Route path="/admin/items/edit/:id" element={<AdminEditItem />} />
              </Routes>
            </main>
            <footer className="py-12 border-t border-slate-100 bg-white">
              <div className="container">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="nav-brand">
                    <span>RentHub</span>
                  </div>
                  <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} RentHub Marketplace. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
