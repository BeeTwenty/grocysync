
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, getCurrentUser, isUserAdmin, createUserByAdmin } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, UserPlus } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        // If user is logged in, check if they're admin
        const admin = await isUserAdmin();
        setIsAdmin(admin);
        setAdminLoading(false);
        
        // Redirect non-admin users to home
        if (!admin) {
          navigate('/');
        }
      } else {
        setAdminLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
      } else {
        // Check if user is admin after successful login
        const admin = await isUserAdmin();
        setIsAdmin(admin);
        
        if (admin) {
          toast.success('Logged in as admin');
        } else {
          toast.success('Logged in successfully');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    
    try {
      // Only admin can create new users
      if (!isAdmin) {
        toast.error('Only admins can create new users');
        return;
      }
      
      const { error } = await createUserByAdmin(newEmail, newPassword, 'user');
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('User created successfully');
        setNewEmail('');
        setNewPassword('');
        setShowCreateUser(false);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };
  
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Grocery List Admin</h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin 
              ? "You're logged in as an admin" 
              : "Login to manage the grocery list"}
          </p>
        </div>
        
        {!isAdmin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center bg-secondary/50 p-4 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-primary mr-2" />
              <span>Admin Access Granted</span>
            </div>
            
            {!showCreateUser ? (
              <Button 
                className="w-full"
                onClick={() => setShowCreateUser(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New User
              </Button>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newEmail">New User Email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New User Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowCreateUser(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={creatingUser}
                  >
                    {creatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                </div>
              </form>
            )}
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              Go to Grocery List
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
