import { Link,useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, User, Bell, LogOut,Search,ChevronLeft,ChevronRight } from 'lucide-react';
import { useState } from 'react';
import SearchPopup from './SearchPopup';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const naviguate = useNavigate()

  if (!isAuthenticated) return null;

  return (
    <>
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div style={{display:"flex", flexDirection:"row"}}><button className='hover:text-green-500 ' onClick={() => naviguate(-1)}><ChevronLeft /> </button><button onClick={() =>naviguate(1)} className='hover:text-green-500'><ChevronRight /></button></div>
          <span onClick={() => naviguate("/feed",{replace:true})} className="text-xl font-bold text-gray-800 hover:cursor-pointer">SocialNet</span>
          <div className="flex items-center space-x-4">
          <button
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Search className="w-6 h-6" />
            </button>
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
    <SearchPopup
    isOpen={isSearchOpen}
    onClose={() => setIsSearchOpen(false)}
    />
    </>
  );
};
export default Navbar;