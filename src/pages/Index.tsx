
import React, { useState, useEffect } from 'react';
import { useGroceryStore, categories, getCategoryById } from '@/lib/groceryStore';
import CategorySection from '@/components/CategorySection';
import AddItemDialog from '@/components/AddItemDialog';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, RefreshCw, UserRound, ShoppingCart, PlusCircle } from 'lucide-react';
import { CategoryType } from '@/types/grocery';

const Index = () => {
  const { items, currentUser, setUserName, fetchItems, isLoading } = useGroceryStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingName, setIsSettingName] = useState(false);
  const [newName, setNewName] = useState(currentUser.name);

  // Fetch items when component mounts
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
  
  // Check if there are any items
  const hasItems = items.length > 0;
  
  // Count uncompleted items
  const uncompletedCount = items.filter(item => !item.completed).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 glass backdrop-blur-md border-b border-border/40 mb-6">
        <div className="container mx-auto py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-medium">Grocery Sync</h1>
              {uncompletedCount > 0 && (
                <span className="ml-2 text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {uncompletedCount} item{uncompletedCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isSettingName ? (
                <form onSubmit={handleNameChange} className="flex gap-2">
                  <Input
                    className="h-9 glass border-none"
                    placeholder="Your name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
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
              
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="glass border-none bg-primary text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
          </div>
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
          <div>
            {itemsByCategory
              .filter(({ items }) => items.length > 0)
              .map(({ category, items }) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  items={items}
                />
              ))}
          </div>
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
      <AddItemDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
};

export default Index;
