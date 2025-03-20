
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CategoriesContent from './CategoriesContent';
import UnknownItemsTab from '@/components/UnknownItemsTab';
import { HelpCircle } from 'lucide-react';
import { CategoryDefinition, GroceryItem } from '@/types/grocery';

interface GroceryTabsProps {
  categorizedItems: Array<{
    category: CategoryDefinition;
    items: GroceryItem[];
  }>;
  unknownItems: GroceryItem[];
  unknownCount: number;
  onTabChange: (value: string) => void;
}

const GroceryTabs: React.FC<GroceryTabsProps> = ({ 
  categorizedItems, 
  unknownItems, 
  unknownCount,
  onTabChange
}) => {
  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={onTabChange}>
      <TabsList className="w-full max-w-md mx-auto mb-6 animate-slide-down">
        <TabsTrigger value="all" className="flex-1 rounded-full">
          All Items
        </TabsTrigger>
        <TabsTrigger value="unknown" className="flex-1 flex items-center gap-1 rounded-full">
          <span>Uncategorized</span>
          {unknownCount > 0 && (
            <span className="ml-1 text-xs rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
              {unknownCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        <CategoriesContent categorizedItems={categorizedItems} />
      </TabsContent>
      
      <TabsContent value="unknown" className="mt-0">
        <div className="bg-background rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-full bg-category-other p-2 w-8 h-8 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-foreground/80" />
            </div>
            <h2 className="text-xl font-medium">Uncategorized Items</h2>
            <span className="text-sm rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
              {unknownItems.length}
            </span>
          </div>
          <UnknownItemsTab items={unknownItems} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default GroceryTabs;
