import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, User, Bell, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">SocialNet</Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <Home className="w-6 h-6" />
            </Link>
            <Link to={`/profile/${user?.id}`} className="text-gray-600 hover:text-gray-900">
              <User className="w-6 h-6" />
            </Link>
            <button className="text-gray-600 hover:text-gray-900">
              <Bell className="w-6 h-6" />
            </button>
            <button 
              onClick={() => logout()}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;