
import React, { useState, useEffect } from 'react';
import { useGroceryStore, categories } from '@/lib/groceryStore';
import AddItemDialog from '@/components/AddItemDialog';
import EmptyState from '@/components/EmptyState';
import QuickAdd from '@/components/QuickAdd';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/layout/Header';
import FloatingActionButton from '@/components/grocery/FloatingActionButton';
import GroceryTabs from '@/components/grocery/GroceryTabs';
import LoadingSpinner from '@/components/grocery/LoadingSpinner';

const Index = () => {
  const {
    items,
    fetchItems,
    fetchCurrentUser,
    isLoading
  } = useGroceryStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchItems();
    fetchCurrentUser();
  }, [fetchItems, fetchCurrentUser]);

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : !hasItems ? (
          <EmptyState onAddItem={() => setIsAddDialogOpen(true)} />
        ) : (
          <>
            <div className="mt-3 mb-6">
              <QuickAdd />
            </div>
            
            <GroceryTabs
              categorizedItems={itemsByCategory}
              unknownItems={unknownItems}
              unknownCount={unknownCount}
              onTabChange={setActiveTab}
            />
            
            {!isMobile && (
              <div className="fixed bottom-6 right-6">
                <Button 
                  onClick={() => setIsAddDialogOpen(true)} 
                  className="glass border-none bg-primary text-white ml-1"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <FloatingActionButton onClick={() => setIsAddDialogOpen(true)} />
      <AddItemDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
};

export default Index;
