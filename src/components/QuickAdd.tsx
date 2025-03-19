
import React, { useState } from 'react';
import { useGroceryStore } from '@/lib/groceryStore';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { CategorizationService } from '@/lib/categorizationService';

const QuickAdd: React.FC = () => {
  const { addItem } = useGroceryStore();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use categorization service to get the category
      const category = await CategorizationService.categorizeItem(itemName.trim());
      
      await addItem({
        name: itemName.trim(),
        quantity,
        completed: false,
        category, // Use the determined category
      });
      
      // Reset form
      setItemName('');
      setQuantity(1);
      toast.success(`Added ${itemName}`);
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-3 rounded-full shadow-md animate-fade-in">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={isMobile ? "Add item..." : "Add item quickly..."}
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="glass h-10 md:h-9 flex-1 rounded-full border-none text-base md:text-sm"
        />
        
        <div className="hidden sm:flex items-center gap-2 w-32">
          <span className="text-sm text-foreground">{quantity}</span>
          <Slider
            value={[quantity]}
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => setQuantity(value[0])}
            className="w-24"
          />
        </div>
        
        {isMobile && (
          <div className="flex items-center gap-1">
            <Button 
              type="button" 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="rounded-full glass border-none bg-secondary text-foreground h-8 w-8 p-0"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              -
            </Button>
            <span className="text-sm min-w-6 text-center text-foreground">{quantity}</span>
            <Button 
              type="button" 
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              className="rounded-full glass border-none bg-secondary text-foreground h-8 w-8 p-0"
              disabled={quantity >= 10}
              aria-label="Increase quantity"
            >
              +
            </Button>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="rounded-full glass border-none bg-primary text-primary-foreground h-10 w-10 p-0"
          disabled={isSubmitting}
          aria-label="Add item quickly"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default QuickAdd;
