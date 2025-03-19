
import React, { useEffect, useState } from 'react';
import { Check, Trash2, Plus, Minus } from 'lucide-react';
import { useGroceryStore } from '@/lib/groceryStore';
import { GroceryItem as GroceryItemType } from '@/types/grocery';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface GroceryItemProps {
  item: GroceryItemType;
  categoryColor: string;
}

const GroceryItem: React.FC<GroceryItemProps> = ({ item, categoryColor }) => {
  const { toggleItem, removeItem } = useGroceryStore();
  const [isHovered, setIsHovered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Format the added time as relative time (e.g., "2 hours ago")
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Set up a timer to delete completed items after 10 seconds
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    
    if (item.completed && timeRemaining === null) {
      // Initialize countdown when an item is first completed
      setTimeRemaining(10);
      
      timerId = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            // When timer reaches 0, clear interval and remove item
            clearInterval(timerId);
            removeItem(item.id);
            toast({
              title: "Item Removed",
              description: `${item.name} has been automatically removed from your list.`,
              duration: 3000,
            });
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!item.completed) {
      // If item is unchecked before timer completes, cancel the timer
      setTimeRemaining(null);
    }
    
    // Cleanup function to clear the interval when component unmounts
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [item.completed, item.id, item.name, removeItem, toast]);

  return (
    <div 
      className={cn(
        "group relative glass rounded-xl p-4 transition-all duration-300 animate-scale-in",
        item.completed ? "opacity-70" : "opacity-100",
        categoryColor
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleItem(item.id)}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
            item.completed 
              ? "bg-primary border-primary text-white" 
              : "border-gray-300 bg-white text-white hover:border-primary"
          )}
          aria-label={item.completed ? "Mark as not purchased" : "Mark as purchased"}
        >
          {item.completed && <Check className="h-3 w-3" />}
        </button>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className={cn(
              "font-medium transition-all",
              item.completed && "line-through text-muted-foreground"
            )}>
              {item.name}
            </p>
            
            {(item.quantity && item.quantity > 0) && (
              <span className="ml-2 text-sm bg-white/70 text-foreground px-2 py-0.5 rounded-full">
                {item.quantity} {item.unit || 'x'}
              </span>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Added by {item.addedBy} {getRelativeTime(item.addedAt)}
          </p>
          
          {item.completed && item.completedBy && item.completedAt && (
            <p className="text-xs text-muted-foreground">
              Purchased by {item.completedBy} {getRelativeTime(item.completedAt)}
              {timeRemaining !== null && (
                <span className="ml-2 text-red-500 font-medium">
                  Removing in {timeRemaining}s
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Actions that appear on hover */}
      <div 
        className={cn(
          "absolute right-2 top-2 flex space-x-1 transition-opacity",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      >
        <button 
          onClick={() => removeItem(item.id)}
          className="rounded-full p-1 text-red-500 bg-white/80 hover:bg-white transition-colors"
          aria-label="Delete item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default GroceryItem;
