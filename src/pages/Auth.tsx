
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import CreateUserForm from '@/components/auth/CreateUserForm';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLoginSuccess = async () => {
    toast.success('Logged in successfully');
    navigate('/');
  };

  if (isLoading) {
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
          <h1 className="text-2xl font-bold">GrocySync</h1>
          <p className="text-muted-foreground mt-2">
            Manage your grocery list
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-4">
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-4">
            <CreateUserForm 
              onCancel={() => setActiveTab('login')}
              onSuccess={() => navigate('/')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
