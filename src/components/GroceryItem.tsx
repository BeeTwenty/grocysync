
import React, { useEffect, useState } from 'react';
import { Check, Trash2, Plus, Minus } from 'lucide-react';
import { useGroceryStore } from '@/lib/groceryStore';
import { GroceryItem as GroceryItemType } from '@/types/grocery';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';

interface GroceryItemProps {
  item: GroceryItemType;
  categoryColor: string;
}

const GroceryItem: React.FC<GroceryItemProps> = ({
  item,
  categoryColor
}) => {
  const {
    toggleItem,
    removeItem,
    updateItemQuantity
  } = useGroceryStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    
    // Only start a new timer if the item is completed and we don't already have a timer running
    if (item.completed && timeRemaining === null) {
      setTimeRemaining(10);
      
      timerId = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerId);
            removeItem(item.id);
            toast({
              title: "Item Removed",
              description: `${item.name} has been automatically removed from your list.`,
              duration: 3000
            });
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!item.completed) {
      // Reset the timer if the item is uncompleted
      clearInterval(timerId);
      setTimeRemaining(null);
    }

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [item.completed, item.id, item.name, removeItem, toast]);

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

  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? (item.quantity || 1) + 1 : Math.max(1, (item.quantity || 1) - 1);
    updateItemQuantity(item.id, newQuantity);
  };
  
  return <div className={cn("group relative glass rounded-xl p-3 transition-all duration-300 animate-scale-in", item.completed ? "opacity-70" : "opacity-100", categoryColor, isMobile ? "p-2.5" : "p-4")} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex items-center gap-3">
        <button onClick={() => toggleItem(item.id)} className={cn(
          "flex shrink-0 items-center justify-center rounded-full border transition-all", 
          item.completed 
            ? "bg-primary border-primary text-white" 
            : isDarkMode 
              ? "border-gray-600 bg-gray-700 text-white hover:border-primary" 
              : "border-gray-300 bg-white text-white hover:border-primary", 
          isMobile ? "h-5 w-5" : "h-6 w-6"
        )} aria-label={item.completed ? "Mark as not purchased" : "Mark as purchased"}>
          {item.completed && <Check className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />}
        </button>
        
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center justify-between">
            <p className={cn("font-medium transition-all", item.completed && "line-through text-muted-foreground", isMobile ? "text-sm" : "text-base")}>
              {item.name}
            </p>
            
            {!item.completed && <div className={cn("flex items-center gap-1 ml-2 rounded-full", isDarkMode ? "bg-gray-700" : "bg-gray-300")}>
                <button onClick={() => handleQuantityChange(false)} className={cn("flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors", isMobile ? "h-5 w-5" : "h-7 w-7")} aria-label="Decrease quantity">
                  <Minus className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                </button>
                
                <span className={cn("px-1 min-w-6 text-center", isMobile ? "text-xs" : "text-sm")}>
                  {item.quantity || 1}
                </span>
                
                <button onClick={() => handleQuantityChange(true)} className={cn("flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors", isMobile ? "h-5 w-5" : "h-7 w-7")} aria-label="Increase quantity">
                  <Plus className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                </button>
              </div>}
            
            {item.completed && item.quantity && item.quantity > 0 && <span className={cn("ml-2 bg-white/70 text-foreground px-2 py-0.5 rounded-full", isMobile ? "text-xs" : "text-sm")}>
                {item.quantity}
              </span>}
          </div>
          
          <p className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>
            Added by {item.addedBy} {getRelativeTime(item.addedAt)}
          </p>
          
          {item.completed && item.completedBy && item.completedAt && <p className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>
              Purchased by {item.completedBy} {getRelativeTime(item.completedAt)}
              {timeRemaining !== null && <span className="ml-2 text-red-500 font-medium animate-pulse">
                  Removing in {timeRemaining}s
                </span>}
            </p>}
          
        </div>
      </div>
    </div>;
};
export default GroceryItem;
