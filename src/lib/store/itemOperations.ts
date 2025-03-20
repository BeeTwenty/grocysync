
import { GroceryItem, CategoryType } from '@/types/grocery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Function to transform database item to app format
export const transformDatabaseItem = (item: any): GroceryItem => ({
  id: item.id,
  name: item.name,
  category: item.category as CategoryType,
  completed: item.completed,
  quantity: item.quantity || undefined,
  unit: item.unit || undefined,
  addedBy: item.added_by,
  addedAt: new Date(item.added_at),
  completedBy: item.completed_by || undefined,
  completedAt: item.completed_at ? new Date(item.completed_at) : undefined
});

// Set up realtime subscription with individual handlers for each event type
export const setupRealtimeSubscription = (
  onInsert: (newItem: GroceryItem) => void,
  onUpdate: (updatedItem: GroceryItem) => void,
  onDelete: (id: string) => void
) => {
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'items'
      },
      (payload) => {
        // Handle new items by adding them to state directly
        const newItem = transformDatabaseItem(payload.new);
        onInsert(newItem);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'items'
      },
      (payload) => {
        // Handle item updates by updating the specific item
        const updatedItem = transformDatabaseItem(payload.new);
        onUpdate(updatedItem);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'items'
      },
      (payload) => {
        // Handle item deletion by removing the specific item
        onDelete(payload.old.id);
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
};

// Fetch items from Supabase
export const fetchItemsFromDB = async (): Promise<GroceryItem[]> => {
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('added_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  // Transform database items to our app's format
  return items.map(transformDatabaseItem);
};
