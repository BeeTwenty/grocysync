
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/api';

interface User {
  id: string;
  email: string;
  display_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          // Get user profile
          const profile = await AuthService.getCurrentUser(); // Fixed: using getCurrentUser method instead of signIn
          if (profile) {
            setUser(profile.user);
          }
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        // Clear invalid auth state
        AuthService.signOut();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await AuthService.signIn(email, password);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      const data = await AuthService.signUp(email, password, displayName);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    AuthService.signOut();
    setUser(null);
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('User not authenticated');
    await AuthService.updatePassword(currentPassword, newPassword, user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
