
import React, { useState } from 'react';
import { useGroceryStore } from '@/lib/groceryStore';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { Slider } from './ui/slider';
import { toast } from 'sonner';

const QuickAdd: React.FC = () => {
  const { addItem } = useGroceryStore();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addItem({
        name: itemName.trim(),
        quantity,
        completed: false,
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
          placeholder="Add item quickly..."
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="glass h-10 md:h-9 flex-1 rounded-full border-none text-base md:text-sm"
        />
        
        <div className="hidden sm:flex items-center gap-2 w-32">
          <span className="text-sm text-muted-foreground">{quantity}</span>
          <Slider
            value={[quantity]}
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => setQuantity(value[0])}
            className="w-24"
          />
        </div>
        
        <Button 
          type="submit" 
          className="rounded-full glass border-none bg-primary text-white h-10 w-10 p-0"
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
