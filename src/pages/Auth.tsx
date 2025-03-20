
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isUserAdmin } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import AdminPanel from '@/components/auth/AdminPanel';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('login');

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

  const handleLoginSuccess = async (isCurrentUserAdmin: boolean) => {
    if (isCurrentUserAdmin) {
      toast.success('Logged in as admin');
      setIsAdmin(true);
    } else {
      toast.success('Logged in successfully');
      navigate('/');
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
          <h1 className="text-2xl font-bold">GrocySync</h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin ? "You're logged in as an admin" : "Login to manage the grocery list"}
          </p>
        </div>
        
        {!isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="login" className="mt-4">
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            </TabsContent>
          </Tabs>
        ) : (
          <AdminPanel />
        )}
      </div>
    </div>
  );
};

export default Auth;
