
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, upsertUserProfile } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';

// Form validation schema
const loginSchema = z.object({
  emailOrDisplayName: z.string().min(1, {
    message: 'Email or display name is required'
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters'
  })
});

export type LoginFormProps = {
  onLoginSuccess: (isAdmin: boolean) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrDisplayName: '',
      password: ''
    }
  });

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
        
        // Signal login success to parent component
        onLoginSuccess(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
        <FormField 
          control={loginForm.control} 
          name="emailOrDisplayName" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email or display name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          control={loginForm.control} 
          name="password" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
