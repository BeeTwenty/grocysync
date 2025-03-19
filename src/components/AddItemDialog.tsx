
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGroceryStore, categories } from '@/lib/groceryStore';
import { CategoryType } from '@/types/grocery';
import { Plus, ShoppingCart } from 'lucide-react';
import { toast } from "sonner";

interface AddItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({ isOpen, onOpenChange }) => {
  const { addItem } = useGroceryStore();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('produce');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter an item name");
      return;
    }
    
    // Create new item
    addItem({
      name: name.trim(),
      category,
      quantity: quantity ? parseInt(quantity, 10) : undefined,
      unit: unit.trim() || undefined,
      completed: false,
    });
    
    // Reset form and close dialog
    resetForm();
    onOpenChange(false);
    
    toast.success(`Added ${name} to your grocery list`);
  };
  
  const resetForm = () => {
    setName('');
    setCategory('produce');
    setQuantity('1');
    setUnit('');
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
            Add a new item to your shared grocery list.
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
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as CategoryType)}>
              <SelectTrigger className="glass border-none">
                <SelectValue placeholder="Select a category" />
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
          
          <div className="grid grid-cols-2 gap-4">
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
            
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit (optional)</Label>
              <Input
                id="unit"
                placeholder="lb, oz, pack..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="glass border-none"
              />
            </div>
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
            >
              Cancel
            </Button>
            <Button type="submit" className="glass border-none bg-primary text-white">
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
