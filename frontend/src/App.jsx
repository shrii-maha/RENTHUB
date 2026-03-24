import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddItem from './pages/AddItem';
import MyRentals from './pages/MyRentals';
import About from './pages/About';
import Contact from './pages/Contact';
import Invoice from './pages/Invoice';
import PaymentSuccess from './pages/PaymentSuccess';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminItems from './pages/admin/AdminItems';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
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
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-item" element={<AddItem />} />
              <Route path="/my-rentals" element={<MyRentals />} />
              <Route path="/invoice/:id" element={<Invoice />} />
              <Route path="/payment-success/:rentalId" element={<PaymentSuccess />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/items" element={<AdminItems />} />
            </Routes>
          </main>
          <footer className="bg-dark text-white text-center p-4 mt-auto">
            <p>&copy; {new Date().getFullYear()} RentHub. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
