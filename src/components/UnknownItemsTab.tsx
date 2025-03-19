
import React from 'react';
import { useGroceryStore, categories, getCategoryById } from '@/lib/groceryStore';
import { GroceryItem, CategoryType } from '@/types/grocery';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface UnknownItemsTabProps {
  items: GroceryItem[];
}

const UnknownItemsTab: React.FC<UnknownItemsTabProps> = ({ items }) => {
  const { toggleItem, removeItem } = useGroceryStore();
  
  // Function to reassign an item to a different category
  const reassignCategory = async (item: GroceryItem, newCategoryId: CategoryType) => {
    // Remove the current item
    await removeItem(item.id);
    
    // Add a new item with the updated category
    await useGroceryStore.getState().addItem({
      name: item.name,
      completed: item.completed,
      quantity: item.quantity,
      unit: item.unit,
      category: newCategoryId,
    });
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="bg-secondary/30 rounded-lg p-4 flex flex-col gap-3 border border-border/50 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{item.name}</h3>
                <span className="text-xs bg-secondary py-1 px-2 rounded-full text-muted-foreground">
                  {item.quantity && `${item.quantity}${item.unit ? ` ${item.unit}` : ''}`}
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
      )}
    </div>
  );
};

export default UnknownItemsTab;
