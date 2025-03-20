
import { ProfileService } from '@/services/api';
import { toast } from 'sonner';

// Get current user from API
export const getCurrentUser = async () => {
  try {
    const profile = await ProfileService.getCurrentUser();
    return {
      id: profile.user_id,
      name: profile.display_name
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      id: 'user1',
      name: 'You'
    };
  }
};

// Updated to use the proper API method
export const setUserName = async (name: string) => {
  try {
    await ProfileService.updateDisplayName(name);
    toast.success('Display name updated successfully');
    return true;
  } catch (error) {
    toast.error('Failed to update display name');
    console.error('Error updating display name:', error);
    return false;
  }
};
