
import React, { useState, useEffect } from 'react';
import { useGroceryStore, categories, getCategoryById } from '@/lib/groceryStore';
import CategorySection from '@/components/CategorySection';
import AddItemDialog from '@/components/AddItemDialog';
import EmptyState from '@/components/EmptyState';
import UnknownItemsTab from '@/components/UnknownItemsTab';
import QuickAdd from '@/components/QuickAdd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, RefreshCw, UserRound, ShoppingCart, PlusCircle, HelpCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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

  // Fetch items and current user when component mounts
  useEffect(() => {
    fetchItems();
    fetchCurrentUser();
  }, [fetchItems, fetchCurrentUser]);

  // Update newName when currentUser changes
  useEffect(() => {
    setNewName(currentUser.name);
  }, [currentUser.name]);

  // Handle name change
  const handleNameChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      setUserName(newName.trim());
      setIsSettingName(false);
    }
  };

  // Group items by category
  const itemsByCategory = categories.map(category => {
    const categoryItems = items.filter(item => item.category === category.id);

    // Sort items: uncompleted first, then by date added (newest first)
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

  // Get unknown items
  const unknownItems = items.filter(item => item.category === 'unknown');

  // Check if there are any items
  const hasItems = items.length > 0;

  // Count uncompleted items
  const uncompletedCount = items.filter(item => !item.completed).length;
  const unknownCount = unknownItems.length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 glass backdrop-blur-md border-b border-border/40 mb-6">
        <div className="container mx-auto py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-medium">GrocySync</h1>
            </div>
            
            <div className="flex items-center gap-2">
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
                  onClick={() => setIsSettingName(true)} 
                  className="text-muted-foreground hover:text-foreground flex gap-2 items-center"
                >
                  <UserRound className="h-4 w-4" />
                  <span>{currentUser.name}</span>
                </Button>
              )}
              
              {!isMobile && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)} 
                  className="glass border-none bg-primary text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              )}
            </div>
          </div>
          
          {/* QuickAdd component for both mobile and desktop */}
          {hasItems && (
            <div className="mt-3 mb-1">
              <QuickAdd />
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : !hasItems ? (
          <EmptyState onAddItem={() => setIsAddDialogOpen(true)} />
        ) : (
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="all" className="flex-1">
                All Items
              </TabsTrigger>
              <TabsTrigger value="unknown" className="flex-1 flex items-center gap-1">
                <span>Uncategorized</span>
                {unknownCount > 0 && (
                  <span className="ml-1 text-xs rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                    {unknownCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div>
                {itemsByCategory
                  .filter(({ items }) => items.length > 0)
                  .map(({ category, items }) => (
                    <CategorySection key={category.id} category={category} items={items} />
                  ))}
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
          </Tabs>
        )}
      </main>

      {/* Floating add button (mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="glass border-none h-14 w-14 rounded-full bg-primary text-white shadow-lg" 
          size="icon"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Add item dialog */}
      <AddItemDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
};

export default Index;
