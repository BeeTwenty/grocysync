
import React, { useEffect, useState } from 'react';
import { Check, Trash2, Plus, Minus } from 'lucide-react';
import { useGroceryStore } from '@/lib/groceryStore';
import { GroceryItem as GroceryItemType } from '@/types/grocery';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface GroceryItemProps {
  item: GroceryItemType;
  categoryColor: string;
}

const GroceryItem: React.FC<GroceryItemProps> = ({ item, categoryColor }) => {
  const { toggleItem, removeItem, updateItemQuantity } = useGroceryStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
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

  // Handle touch for mobile users
  const handleTouchStart = () => {
    if (isMobile) {
      setIsTouched(true);
    }
  };

  const handleTouchEnd = () => {
    if (isMobile) {
      setIsTouched(false);
    }
  };

  // Handle quantity adjustment
  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment 
      ? (item.quantity || 1) + 1 
      : Math.max(1, (item.quantity || 1) - 1);
    
    updateItemQuantity(item.id, newQuantity);
  };

  return (
    <div 
      className={cn(
        "group relative glass rounded-xl p-4 transition-all duration-300 animate-scale-in",
        item.completed ? "opacity-70" : "opacity-100",
        categoryColor
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleItem(item.id)}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
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
              "font-medium transition-all text-base",
              item.completed && "line-through text-muted-foreground"
            )}>
              {item.name}
            </p>
            
            {/* Quantity controls and display */}
            {!item.completed && (
              <div className="flex items-center gap-1 ml-2 bg-white/70 text-foreground rounded-full">
                <button 
                  onClick={() => handleQuantityChange(false)}
                  className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                
                <span className="text-sm px-1 min-w-6 text-center">
                  {item.quantity || 1}
                </span>
                
                <button 
                  onClick={() => handleQuantityChange(true)}
                  className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {/* For completed items, just show the quantity */}
            {item.completed && item.quantity && item.quantity > 0 && (
              <span className="ml-2 text-sm bg-white/70 text-foreground px-2 py-0.5 rounded-full">
                {item.quantity}
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

      {/* Actions that appear on hover or always visible on mobile */}
      <div 
        className={cn(
          "absolute right-2 top-2 flex space-x-1 transition-opacity",
          (isHovered || isTouched || isMobile) ? "opacity-100" : "opacity-0"
        )}
      >
        <button 
          onClick={() => removeItem(item.id)}
          className="rounded-full p-2 text-red-500 bg-white/80 hover:bg-white transition-colors"
          aria-label="Delete item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default GroceryItem;
