
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ProfileService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

// Form validation schema for display name
const displayNameSchema = z.object({
  displayName: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }),
});

// Form validation schema for password
const passwordSchema = z.object({
  currentPassword: z.string().min(6, {
    message: 'Current password must be at least 6 characters.',
  }),
  newPassword: z.string().min(6, {
    message: 'New password must be at least 6 characters.',
  }),
  confirmPassword: z.string().min(6, {
    message: 'Confirm password must be at least 6 characters.',
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type DisplayNameFormValues = z.infer<typeof displayNameSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

type UserProfileFormProps = {
  onSuccess: () => void;
  initialDisplayName: string;
};

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onSuccess, initialDisplayName }) => {
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const { updatePassword } = useAuth();

  // Display name form
  const displayNameForm = useForm<DisplayNameFormValues>({
    resolver: zodResolver(displayNameSchema),
    defaultValues: {
      displayName: initialDisplayName,
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleUpdateDisplayName = async (values: DisplayNameFormValues) => {
    if (values.displayName === initialDisplayName) {
      return;
    }
    
    setIsUpdatingName(true);
    try {
      await ProfileService.updateDisplayName(values.displayName);
      toast.success('Display name updated successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating display name:', error);
      toast.error(error.message || 'Failed to update display name');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (values: PasswordFormValues) => {
    setIsUpdatingPassword(true);
    try {
      await updatePassword(values.currentPassword, values.newPassword);
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password updated successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Display Name</h3>
        <p className="text-sm text-muted-foreground">
          Update your display name
        </p>
        
        <Form {...displayNameForm}>
          <form onSubmit={displayNameForm.handleSubmit(handleUpdateDisplayName)} className="space-y-4 mt-4">
            <FormField
              control={displayNameForm.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isUpdatingName}>
              {isUpdatingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Name
            </Button>
          </form>
        </Form>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Password</h3>
        <p className="text-sm text-muted-foreground">
          Change your password
        </p>
        
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)} className="space-y-4 mt-4">
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UserProfileForm;
