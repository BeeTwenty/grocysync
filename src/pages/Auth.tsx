import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, getCurrentUser, isUserAdmin, createUserByAdmin, updateUserDisplayName, upsertUserProfile } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, UserPlus, UserRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Form validation schemas
const loginSchema = z.object({
  emailOrDisplayName: z.string().min(1, {
    message: 'Email or display name is required'
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters'
  })
});
const createUserSchema = z.object({
  newEmail: z.string().email({
    message: 'Please enter a valid email'
  }),
  displayName: z.string().min(2, {
    message: 'Display name must be at least 2 characters'
  }),
  newPassword: z.string().min(6, {
    message: 'Password must be at least 6 characters'
  })
});
const Auth = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('login');

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrDisplayName: '',
      password: ''
    }
  });

  // Create user form
  const createUserForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      newEmail: '',
      displayName: '',
      newPassword: ''
    }
  });
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
  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const {
        error,
        data
      } = await signIn(values.emailOrDisplayName, values.password);
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

          // Create or update profile if it doesn't exist
          if (data && data.user) {
            try {
              // Use user email as display name if none was provided (first-time login)
              const displayName = data.user.user_metadata?.name || values.emailOrDisplayName;

              // Update or create profile
              await upsertUserProfile(data.user.id, data.user.email || '', displayName);
            } catch (profileError) {
              console.error('Error creating/updating profile:', profileError);
            }
          }
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
  const handleCreateUser = async (values: z.infer<typeof createUserSchema>) => {
    setCreatingUser(true);
    try {
      // Only admin can create new users
      if (!isAdmin) {
        toast.error('Only admins can create new users');
        return;
      }
      const {
        error
      } = await createUserByAdmin(values.newEmail, values.newPassword, 'user', values.displayName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('User created successfully');
        createUserForm.reset();
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
    return <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="container max-w-md mx-auto py-12 px-4">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">GrocySync</h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin ? "You're logged in as an admin" : "Login to manage the grocery list"}
          </p>
        </div>
        
        {!isAdmin ? <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            
            <TabsContent value="login" className="mt-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField control={loginForm.control} name="emailOrDisplayName" render={({
                field
              }) => <FormItem>
                        <FormLabel>Email or Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email or display name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={loginForm.control} name="password" render={({
                field
              }) => <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs> : <div className="space-y-6">
            <div className="flex items-center justify-center bg-secondary/50 p-4 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-primary mr-2" />
              <span>Admin Access Granted</span>
            </div>
            
            {!showCreateUser ? <Button className="w-full" onClick={() => setShowCreateUser(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create New User
              </Button> : <Form {...createUserForm}>
                <form onSubmit={createUserForm.handleSubmit(handleCreateUser)} className="space-y-4">
                  <FormField control={createUserForm.control} name="newEmail" render={({
              field
            }) => <FormItem>
                        <FormLabel>New User Email</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={createUserForm.control} name="displayName" render={({
              field
            }) => <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={createUserForm.control} name="newPassword" render={({
              field
            }) => <FormItem>
                        <FormLabel>New User Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateUser(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={creatingUser}>
                      {creatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create User
                    </Button>
                  </div>
                </form>
              </Form>}
            
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              Go to Grocery List
            </Button>
          </div>}
      </div>
    </div>;
};
export default Auth;