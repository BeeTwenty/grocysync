
import React, { useState } from 'react';
import { ShoppingCart, UserRound, LogOut, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useGroceryStore } from '@/lib/groceryStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { signOut, updateUserDisplayName } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import UserProfileForm from '@/components/profile/UserProfileForm';

const Header = () => {
  const { currentUser, setUserName } = useGroceryStore();
  const [isSettingName, setIsSettingName] = useState(false);
  const [newName, setNewName] = useState(currentUser.name);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  React.useEffect(() => {
    setNewName(currentUser.name);
  }, [currentUser.name]);

  const handleNameChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      setUserName(newName.trim());
      setIsSettingName(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className="sticky top-0 z-10 glass backdrop-blur-md border-b border-border/40 mb-6">
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-medium">GrocySync</h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-2">
            <ThemeToggle />
            
            {isSettingName ? (
              <form onSubmit={handleNameChange} className="flex gap-2">
                <Input 
                  className="h-9 glass border-none" 
                  placeholder="Your name" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  autoFocus 
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="glass border-none bg-primary text-white"
                >
                  Save
                </Button>
              </form>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setProfileDialogOpen(true)} 
                className="text-muted-foreground hover:text-foreground flex gap-2 items-center px-2 sm:px-3"
              >
                <UserRound className="h-4 w-4" />
                {!isMobile && <span>{currentUser.name}</span>}
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut} 
              className="text-muted-foreground hover:text-foreground flex gap-2 items-center px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              {!isMobile && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile details and password
            </DialogDescription>
          </DialogHeader>
          <UserProfileForm 
            onSuccess={() => {
              setProfileDialogOpen(false);
              toast.success('Profile updated successfully');
            }}
            initialDisplayName={currentUser.name}
          />
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
