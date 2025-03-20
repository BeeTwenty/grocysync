import React, { useState, useEffect } from 'react';
import { useGroceryStore, categories } from '@/lib/groceryStore';
import CategorySection from '@/components/CategorySection';
import AddItemDialog from '@/components/AddItemDialog';
import EmptyState from '@/components/EmptyState';
import UnknownItemsTab from '@/components/UnknownItemsTab';
import QuickAdd from '@/components/QuickAdd';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, RefreshCw, UserRound, ShoppingCart, PlusCircle, HelpCircle, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { signOut } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const {
    items,
    currentUser,
    setUserName,
    fetchItems,
    fetchCurrentUser,
    isLoading
  } = useGroceryStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingName, setIsSettingName] = useState(false);
  const [newName, setNewName] = useState(currentUser.name);
  const [activeTab, setActiveTab] = useState("all");
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
    fetchCurrentUser();
  }, [fetchItems, fetchCurrentUser]);

  useEffect(() => {
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

  const itemsByCategory = categories.map(category => {
    const categoryItems = items.filter(item => item.category === category.id);

    categoryItems.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });
    return {
      category,
      items: categoryItems
    };
  });

  const unknownItems = items.filter(item => item.category === 'unknown');

  const hasItems = items.length > 0;

  const uncompletedCount = items.filter(item => !item.completed).length;
  const unknownCount = unknownItems.length;

  return <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 glass backdrop-blur-md border-b border-border/40 mb-6">
        <div className="container mx-auto py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-medium">GrocySync</h1>
            </div>
            
            <div className="flex items-center gap-3 md:gap-2">
              <ThemeToggle />
              
              {isSettingName ? <form onSubmit={handleNameChange} className="flex gap-2">
                  <Input className="h-9 glass border-none" placeholder="Your name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                  <Button type="submit" size="sm" className="glass border-none bg-primary text-white">
                    Save
                  </Button>
                </form> : <Button variant="ghost" size="sm" onClick={() => setIsSettingName(true)} className="text-muted-foreground hover:text-foreground flex gap-2 items-center px-2 sm:px-3">
                  <UserRound className="h-4 w-4" />
                  {!isMobile && <span>{currentUser.name}</span>}
                </Button>}
              
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground flex gap-2 items-center px-2 sm:px-3">
                <LogOut className="h-4 w-4" />
                {!isMobile && <span>Sign Out</span>}
              </Button>
              
              {!isMobile && <Button onClick={() => setIsAddDialogOpen(true)} className="glass border-none bg-primary text-white ml-1">
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>}
            </div>
          </div>
          
          {hasItems && <div className="mt-3 mb-1">
              <QuickAdd />
            </div>}
        </div>
      </header>

      <main className="container mx-auto px-4">
        {isLoading ? <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          </div> : !hasItems ? <EmptyState onAddItem={() => setIsAddDialogOpen(true)} /> : <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full max-w-md mx-auto mb-6 animate-slide-down">
              <TabsTrigger value="all" className="flex-1 rounded-full">
                All Items
              </TabsTrigger>
              <TabsTrigger value="unknown" className="flex-1 flex items-center gap-1 rounded-full">
                <span>Uncategorized</span>
                {unknownCount > 0 && <span className="ml-1 text-xs rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                    {unknownCount}
                  </span>}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div>
                {itemsByCategory.filter(({
              items
            }) => items.length > 0).map(({
              category,
              items
            }) => <CategorySection key={category.id} category={category} items={items} />)}
              </div>
            </TabsContent>
            
            <TabsContent value="unknown" className="mt-0">
              <div className="bg-background rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-full bg-category-other p-2 w-8 h-8 flex items-center justify-center">
                    <HelpCircle className="h-4 w-4 text-foreground/80" />
                  </div>
                  <h2 className="text-xl font-medium">Uncategorized Items</h2>
                  <span className="text-sm rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                    {unknownItems.length}
                  </span>
                </div>
                <UnknownItemsTab items={unknownItems} />
              </div>
            </TabsContent>
          </Tabs>}
      </main>

      <div className="fixed bottom-6 right-6 md:hidden">
        <Button onClick={() => setIsAddDialogOpen(true)} className="glass border-none h-14 w-14 rounded-full bg-primary text-white shadow-lg" size="icon">
          <PlusCircle className="h-6 w-6" />
        </Button>
      </div>

      <AddItemDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>;
};

export default Index;
