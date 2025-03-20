
import React from 'react';
import { GroceryItem as GroceryItemType } from '@/types/grocery';
import { CategoryDefinition } from '@/types/grocery';
import GroceryItem from './GroceryItem';
import { 
  Apple, Home, Baby, Cookie, Snowflake, GlassWater, Cat, 
  Utensils, Package, ShoppingCart, Egg, Flame, Droplet, 
  Package2, Milk, Pill, Drumstick, MoreHorizontal, 
  Leaf, Carrot, HelpCircle, Cannabis 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CategorySectionProps {
  category: CategoryDefinition;
  items: GroceryItemType[];
}

// Map of category icons based on the icon string
const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
  'help-circle': HelpCircle,
  'baby': Baby,
  'home': Home,
  'cookie': Cookie,
  'snowflake': Snowflake,
  'glass-cheers': GlassWater,
  'glass-water': GlassWater,
  'cat': Cat,
  'utensils': Utensils,
  'package': Package,
  'shopping-cart': ShoppingCart,
  'basket-shopping': ShoppingCart,
  'egg': Egg,
  'flame': Flame,
  'pepper-hot': Flame,
  'droplet': Droplet,
  'package-2': Package2,
  'milk': Milk,
  'cow': Milk,
  'apple': Apple,
  'pill': Pill,
  'capsules': Pill,
  'seedling': Leaf,
  'drumstick': Drumstick,
  'drumstick-bite': Drumstick,
  'more-horizontal': MoreHorizontal,
  'cannabis': Cannabis,
  'plant': Cannabis,
  'carrot': Carrot,
  'flour': Package,
  'bread-slice': Cookie,
  'can': Package,
  'spoon': Utensils,
  'kitchen-set': Utensils,
  'pump-soap': Droplet
};

const CategorySection: React.FC<CategorySectionProps> = ({ category, items }) => {
  // Get the icon component or default to HelpCircle
  const IconComponent = categoryIcons[category.icon] || HelpCircle;
  const isMobile = useIsMobile();

  // Don't render the section if there are no items
  if (items.length === 0) return null;

  return (
    <div className="mb-6 animate-slide-up" style={{ animationDelay: `${0.05 * items.length}s` }}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          `rounded-full ${category.color} dark:bg-opacity-30 flex items-center justify-center`,
          isMobile ? "p-1.5 w-6 h-6" : "p-2 w-8 h-8"
        )}>
          <IconComponent className={cn("text-foreground/80", isMobile ? "h-3 w-3" : "h-4 w-4")} />
        </div>
        <h2 className={cn("font-medium", isMobile ? "text-lg" : "text-xl")}>{category.name}</h2>
        <span className="text-sm rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
          {items.filter(item => !item.completed).length}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((item) => (
          <GroceryItem 
            key={item.id} 
            item={item} 
            categoryColor={`${category.color} dark:bg-opacity-20`}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
