import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import axios from '../axios.call';
import useDebounce from '../hooks/useDebounce';


interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchPopup = ({ isOpen, onClose }: SearchPopupProps) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    const searchUsers = async () => {
      if (debouncedQuery.trim()) {
        try {
          const response = await axios.get(`/user/search/${debouncedQuery}`);
          console.log(response.data)
          setUsers(response.data.users ? response.data.users : []);
        } catch (error) {
          console.error('Error searching users:', error);
        }
      } else {
        setUsers([]);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex items-center">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 ml-3 outline-none"
            autoFocus
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {users.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`}
              onClick={onClose}
              className="flex items-center p-4 hover:bg-gray-50"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <span className="ml-3 font-medium text-gray-900">{user.name}</span>
            </Link>
          ))}
          {query && users.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;