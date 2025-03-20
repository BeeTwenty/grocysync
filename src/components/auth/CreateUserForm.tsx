
import React, { useState } from 'react';
import { createUserByAdmin } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';

// Form validation schema
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

export type CreateUserFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onCancel, onSuccess }) => {
  const [creatingUser, setCreatingUser] = useState(false);

  // Create user form
  const createUserForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      newEmail: '',
      displayName: '',
      newPassword: ''
    }
  });

  const handleCreateUser = async (values: z.infer<typeof createUserSchema>) => {
    setCreatingUser(true);
    try {
      const { error } = await createUserByAdmin(values.newEmail, values.newPassword, 'user', values.displayName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('User created successfully');
        createUserForm.reset();
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <Form {...createUserForm}>
      <form onSubmit={createUserForm.handleSubmit(handleCreateUser)} className="space-y-4">
        <FormField 
          control={createUserForm.control} 
          name="newEmail" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>New User Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          control={createUserForm.control} 
          name="displayName" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          control={createUserForm.control} 
          name="newPassword" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>New User Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <div className="flex space-x-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={creatingUser}>
            {creatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create User
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateUserForm;
