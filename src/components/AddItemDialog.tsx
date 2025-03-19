
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGroceryStore, categories } from '@/lib/groceryStore';
import { CategoryType } from '@/types/grocery';
import { ShoppingCart } from 'lucide-react';
import { toast } from "sonner";

interface AddItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({ isOpen, onOpenChange }) => {
  const { addItem } = useGroceryStore();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType | undefined>(undefined);
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter an item name");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create new item (category will be auto-detected if not specified)
      await addItem({
        name: name.trim(),
        category, // This can be undefined and will be auto-detected
        quantity: quantity ? parseInt(quantity, 10) : undefined,
        completed: false,
      });
      
      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setCategory(undefined);
    setQuantity('1');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md border-none shadow-lg backdrop-blur-lg animate-fade-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Add Grocery Item
          </DialogTitle>
          <DialogDescription>
            Add a new item to your shared grocery list. Items will be automatically categorized.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              placeholder="Milk, Apples, Bread..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass border-none"
              autoFocus
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Category (Optional - Auto-detected)</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as CategoryType)}>
              <SelectTrigger className="glass border-none">
                <SelectValue placeholder="Auto-detect category" />
              </SelectTrigger>
              <SelectContent className="glass border-none">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="capitalize">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="glass border-none"
            />
          </div>
          
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="glass border-none"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="glass border-none bg-primary text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
