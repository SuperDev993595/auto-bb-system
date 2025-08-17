import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { authService, User, LoginCredentials, RegisterData, ChangePasswordData } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  changePassword: (passwordData: ChangePasswordData) => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isBusinessClient: () => boolean;
  isCustomer: () => boolean;
  isAnyAdmin: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear storage
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success) {
        console.log('AuthContext: Login successful, setting user:', response.data.user);
        setUser(response.data.user);
        toast.success('Login successful!');
        return true;
      } else {
        console.log('AuthContext: Login failed:', response.message);
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        toast.success('User registered successfully!');
        return true;
      } else {
        toast.error(response.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const changePassword = async (passwordData: ChangePasswordData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.changePassword(passwordData);
      
      if (response.success) {
        toast.success('Password changed successfully!');
        return true;
      } else {
        toast.error(response.message || 'Password change failed');
        return false;
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Password change failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(permission);
  };

  const isSuperAdmin = (): boolean => {
    return authService.isSuperAdmin();
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  const isBusinessClient = (): boolean => {
    return authService.isBusinessClient();
  };

  const isCustomer = (): boolean => {
    return authService.isCustomer();
  };

  const isAnyAdmin = (): boolean => {
    return authService.isAnyAdmin();
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.getCurrentUser();
        if (response.success) {
          setUser(response.data.user);
        }
      }
    } catch (error) {
      console.error('User refresh error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    changePassword,
    hasPermission,
    isSuperAdmin,
    isAdmin,
    isBusinessClient,
    isCustomer,
    isAnyAdmin,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
