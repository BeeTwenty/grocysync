
import { getUserDisplayName, updateUserDisplayName } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Get current user from Supabase
export const getCurrentUser = async () => {
  const displayName = await getUserDisplayName();
  return {
    id: 'user1',
    name: displayName || 'You'
  };
};

// Updated to use the proper authentication update method
export const setUserName = async (name: string) => {
  // Use the updateUserDisplayName function from the client
  const { data, error } = await updateUserDisplayName(name);
  
  if (error) {
    toast.error('Failed to update display name');
    console.error('Error updating display name:', error);
    return false;
  }
  
  toast.success('Display name updated successfully');
  return true;
};
