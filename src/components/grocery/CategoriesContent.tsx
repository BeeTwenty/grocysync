
import React from 'react';
import { CategoryDefinition, GroceryItem } from '@/types/grocery';
import CategorySection from '@/components/CategorySection';

interface CategoriesContentProps {
  categorizedItems: Array<{
    category: CategoryDefinition;
    items: GroceryItem[];
  }>;
}

const CategoriesContent: React.FC<CategoriesContentProps> = ({ categorizedItems }) => {
  return (
    <div>
      {categorizedItems
        .filter(({ items }) => items.length > 0)
        .map(({ category, items }) => (
          <CategorySection key={category.id} category={category} items={items} />
        ))}
    </div>
  );
};

export default CategoriesContent;
