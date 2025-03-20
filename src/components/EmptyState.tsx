import React from 'react';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
interface EmptyStateProps {
  onAddItem: () => void;
}
const EmptyState: React.FC<EmptyStateProps> = ({
  onAddItem
}) => {
  return <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4 animate-slide-down">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="glass rounded-full p-5 md:p-6 mb-4">
        <ShoppingCart className="h-10 w-10 md:h-12 md:w-12 text-primary" />
      </div>
      <h2 className="text-xl md:text-2xl font-medium mb-2 text-center">Your grocery list is empty</h2>
      <p className="text-sm md:text-base text-muted-foreground text-center max-w-md mb-6">
        Start adding items to your grocery list. All changes will be visible in real-time to other people sharing this list.
      </p>
      <Button onClick={onAddItem} className="glass border-none bg-primary w-full sm:w-auto text-slate-500">
        <Plus className="mr-2 h-4 w-4" /> Add First Item
      </Button>
    </div>;
};
export default EmptyState;