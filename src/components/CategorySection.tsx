
import React from 'react';
import { GroceryItem as GroceryItemType } from '@/types/grocery';
import { CategoryDefinition } from '@/types/grocery';
import GroceryItem from './GroceryItem';
import { 
  Apple, Home, Baby, Cookie, Snowflake, Glass, Cat, 
  Utensils, Package, ShoppingCart, Egg, Flame, Droplet, 
  Package2, Milk, Pill, Drop, Drumstick, MoreHorizontal, 
  Plant, Carrot, HelpCircle 
} from 'lucide-react';

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
  'glass': Glass,
  'cat': Cat,
  'utensils': Utensils,
  'package': Package,
  'shopping-cart': ShoppingCart,
  'egg': Egg,
  'flame': Flame,
  'droplet': Droplet,
  'package-2': Package2,
  'milk': Milk,
  'apple': Apple,
  'pill': Pill,
  'drop': Drop,
  'drumstick': Drumstick,
  'more-horizontal': MoreHorizontal,
  'plant': Plant,
  'carrot': Carrot
};

const CategorySection: React.FC<CategorySectionProps> = ({ category, items }) => {
  // Get the icon component or default to HelpCircle
  const IconComponent = categoryIcons[category.icon] || HelpCircle;

  // Don't render the section if there are no items
  if (items.length === 0) return null;

  return (
    <div className="mb-8 animate-slide-up" style={{ animationDelay: `${0.05 * items.length}s` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`rounded-full ${category.color} p-2 w-8 h-8 flex items-center justify-center`}>
          <IconComponent className="h-4 w-4 text-foreground/80" />
        </div>
        <h2 className="text-xl font-medium">{category.name}</h2>
        <span className="text-sm rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
          {items.filter(item => !item.completed).length}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <GroceryItem 
            key={item.id} 
            item={item} 
            categoryColor={`${category.color}/30`}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
