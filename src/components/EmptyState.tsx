
import React from 'react';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddItem: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddItem }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-slide-down">
      <div className="glass rounded-full p-6 mb-4">
        <ShoppingCart className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-medium mb-2">Your grocery list is empty</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Start adding items to your grocery list. All changes will be visible in real-time to other people sharing this list.
      </p>
      <Button onClick={onAddItem} className="glass border-none bg-primary text-white">
        <Plus className="mr-2 h-4 w-4" /> Add First Item
      </Button>
    </div>
  );
};

export default EmptyState;
