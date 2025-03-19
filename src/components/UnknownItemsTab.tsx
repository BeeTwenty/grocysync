
import React, { useState } from 'react';
import { useGroceryStore, categories, getCategoryById } from '@/lib/groceryStore';
import { GroceryItem, CategoryType } from '@/types/grocery';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { CategorizationService } from '@/lib/categorizationService';
import { toast } from 'sonner';

interface UnknownItemsTabProps {
  items: GroceryItem[];
}

const UnknownItemsTab: React.FC<UnknownItemsTabProps> = ({ items }) => {
  const { toggleItem, removeItem } = useGroceryStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Function to reassign an item to a different category
  const reassignCategory = async (item: GroceryItem, newCategoryId: CategoryType) => {
    try {
      // First, learn this categorization for future items
      await CategorizationService.learnItemCategorization(item.name, newCategoryId);
      
      // Remove the current item
      await removeItem(item.id);
      
      // Add a new item with the updated category
      await useGroceryStore.getState().addItem({
        name: item.name,
        completed: item.completed,
        quantity: item.quantity,
        category: newCategoryId,
      });
      
      toast.success(`Moved "${item.name}" to ${getCategoryById(newCategoryId).name} category`);
    } catch (error) {
      console.error("Error reassigning category:", error);
      toast.error("Failed to reassign category. Please try again.");
    }
  };

  // Function to auto-categorize an item
  const autoCategorizeSingle = async (item: GroceryItem) => {
    try {
      // Get suggested category
      const suggestedCategory = await CategorizationService.categorizeItem(item.name);
      
      if (suggestedCategory !== 'unknown') {
        await reassignCategory(item, suggestedCategory);
        toast.success(`Auto-categorized "${item.name}" as ${getCategoryById(suggestedCategory).name}`);
      } else {
        toast.error(`Couldn't auto-categorize "${item.name}"`);
      }
    } catch (error) {
      console.error("Error auto-categorizing:", error);
      toast.error("Failed to auto-categorize. Please try again.");
    }
  };

  // Filter items based on search query
  const filteredItems = searchQuery 
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  return (
    <div className="mt-4">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground">No uncategorized items found.</p>
          <p className="text-sm text-muted-foreground">
            Items with unknown categories will appear here for categorization.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 relative">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search uncategorized items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 glass border-none"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-secondary/30 rounded-lg p-4 flex flex-col gap-3 border border-border/50 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{item.name}</h3>
                  <span className="text-xs bg-secondary py-1 px-2 rounded-full text-muted-foreground">
                    {item.quantity && `${item.quantity}`}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Select 
                    onValueChange={(value) => reassignCategory(item, value as CategoryType)}
                    defaultValue={item.category}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full mt-1"
                    onClick={() => autoCategorizeSingle(item)}
                  >
                    Auto-categorize
                  </Button>
                  
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => toggleItem(item.id)}
                    >
                      {item.completed ? 'Mark Active' : 'Mark Complete'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UnknownItemsTab;
