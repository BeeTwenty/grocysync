
import React from 'react';
import { GroceryItem as GroceryItemType } from '@/types/grocery';
import { CategoryDefinition } from '@/types/grocery';
import GroceryItem from './GroceryItem';
import { icons } from 'lucide-react';

interface CategorySectionProps {
  category: CategoryDefinition;
  items: GroceryItemType[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, items }) => {
  const Icon = icons[category.icon as keyof typeof icons];

  // Don't render the section if there are no items
  if (items.length === 0) return null;

  return (
    <div className="mb-8 animate-slide-up" style={{ animationDelay: `${0.05 * items.length}s` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`rounded-full ${category.color} p-2 w-8 h-8 flex items-center justify-center`}>
          {Icon && <Icon className="h-4 w-4 text-foreground/80" />}
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
