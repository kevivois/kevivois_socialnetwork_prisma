import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../axios.call'
interface AuthContextType {
  user: any;
  userId:String;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId,setUserId] = useState("")

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/auth/isAuth');
      if (response.data) {
        if(response.data.auth == true){
          setUser(response.data.user ? response.data.user : user);
          setUserId(response.data.user ? response.data.user.id : "")
          setIsAuthenticated(true);
          return
        }
        throw new Error("not authenticated")
      }
    } catch (error) {
      console.log(error)
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await axios.post('/auth/login', { username, password });
    setUser(response.data);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await axios.post('/auth/logout');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user,userId, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};