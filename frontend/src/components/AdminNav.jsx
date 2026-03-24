import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package } from 'lucide-react';

const AdminNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="flex gap-4 mb-8 pb-4 border-b">
      <Link to="/admin/dashboard" className={`btn ${path === '/admin/dashboard' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}>
        <LayoutDashboard size={18} /> Overview
      </Link>
      <Link to="/admin/users" className={`btn ${path.includes('/admin/users') ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}>
        <Users size={18} /> Manage Users
      </Link>
      <Link to="/admin/items" className={`btn ${path.includes('/admin/items') ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}>
        <Package size={18} /> Manage Items
      </Link>
    </div>
  );
};

export default AdminNav;
