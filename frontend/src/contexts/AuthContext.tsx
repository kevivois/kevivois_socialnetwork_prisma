import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../axios.call'
interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading:boolean;
  reFetch: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const reFetch = async () => {
    await checkAuth();
  }

  const checkAuth = async () => {
    try {
      const response = await axios.get('/auth/isAuth');
      if (response.data) {
        if(response.data.auth == true){
          setUser(response.data.user ? response.data.user : user);
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
    finally {
      setIsLoading(false)
    }
  };

  const login = async (username: string, password: string) => {
    const response = await axios.post('/auth/login', { username, password });
    await checkAuth();
  };

  const logout = async () => {
    await axios.post('/auth/logout');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated,isLoading ,reFetch}}>
      {children}
    </AuthContext.Provider>
  );
};