import { create } from 'zustand';
import { GroceryItem, CategoryType, CategoryDefinition } from '../types/grocery';
import { supabase, getUserDisplayName } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define categories with their properties using the updated data
export const categories: CategoryDefinition[] = [
  { id: 'unknown', name: 'Ukjent', icon: 'help-circle', color: 'bg-category-other' },
  { id: 'baby', name: 'Baby', icon: 'baby', color: 'bg-category-dairy' },
  { id: 'household', name: 'Husholdningsartikler', icon: 'home', color: 'bg-category-household' },
  { id: 'snacks', name: 'Snacks', icon: 'cookie', color: 'bg-category-other' },
  { id: 'frozen', name: 'Frysedisken', icon: 'snowflake', color: 'bg-category-frozen' },
  { id: 'beverages', name: 'Drikke', icon: 'glass', color: 'bg-category-other' },
  { id: 'pets', name: 'Kjæledy', icon: 'cat', color: 'bg-category-other' },
  { id: 'utensils', name: 'Redskaper', icon: 'utensils', color: 'bg-category-household' },
  { id: 'canned', name: 'Hermetikk', icon: 'package', color: 'bg-category-pantry' },
  { id: 'checkout', name: 'Kassen', icon: 'shopping-cart', color: 'bg-category-other' },
  { id: 'easter', name: 'PåskeFerie', icon: 'egg', color: 'bg-category-other' },
  { id: 'spices', name: 'Krydder', icon: 'flame', color: 'bg-category-pantry' },
  { id: 'hygiene', name: 'Hygiene', icon: 'droplet', color: 'bg-category-household' },
  { id: 'dry_goods', name: 'Tørrvare', icon: 'package-2', color: 'bg-category-pantry' },
  { id: 'bakery', name: 'Bakevarer', icon: 'cookie', color: 'bg-category-bakery' },
  { id: 'dairy', name: 'Meieri', icon: 'milk', color: 'bg-category-dairy' },
  { id: 'fruit', name: 'Frukt', icon: 'apple', color: 'bg-category-produce' },
  { id: 'supplements', name: 'Kosttilskudd', icon: 'pill', color: 'bg-category-other' },
  { id: 'spreads', name: 'Pålegg', icon: 'utensils', color: 'bg-category-pantry' },
  { id: 'sauce', name: 'Saus', icon: 'drop', color: 'bg-category-pantry' },
  { id: 'meat', name: 'Kjøtt', icon: 'drumstick', color: 'bg-category-meat' },
  { id: 'misc', name: 'Diverse', icon: 'more-horizontal', color: 'bg-category-other' },
  { id: 'herbs', name: 'Urter', icon: 'plant', color: 'bg-category-produce' },
  { id: 'vegetables', name: 'Grønnsaker', icon: 'carrot', color: 'bg-category-produce' }
];

// Get current user from Supabase
const getCurrentUser = async () => {
  const displayName = await getUserDisplayName();
  return {
    id: 'user1',
    name: displayName || 'You'
  };
};

// Store is no longer needed as we use Supabase user_metadata
export const setUserName = async (name: string) => {
  const { error } = await supabase.auth.updateUser({
    data: { name }
  });
  
  if (error) {
    toast.error('Failed to update display name');
    console.error('Error updating display name:', error);
    return false;
  }
  
  toast.success('Display name updated successfully');
  return true;
};

interface GroceryState {
  items: GroceryItem[];
  currentUser: { id: string; name: string };
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  addItem: (item: Omit<GroceryItem, 'id' | 'addedBy' | 'addedAt' | 'category'> & { category?: CategoryType }) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItemQuantity: (id: string, quantity: number) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
}

export const useGroceryStore = create<GroceryState>((set, get) => {
  // Set up realtime subscription
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items'
        },
        () => {
          // Refetch items when changes occur
          get().fetchItems();
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Set up realtime subscription when the store is created
  setupRealtimeSubscription();

  return {
    items: [],
    currentUser: { id: 'user1', name: 'You' },
    isLoading: true,
    error: null,
    
    fetchItems: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const { data: items, error } = await supabase
          .from('items')
          .select('*')
          .order('added_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Transform database items to our app's format
        const transformedItems: GroceryItem[] = items.map(item => ({
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
        }));
        
        set({ items: transformedItems, isLoading: false });
      } catch (error) {
        console.error('Error fetching items:', error);
        set({ 
          error: 'Failed to fetch grocery items. Please try again later.', 
          isLoading: false 
        });
        toast.error('Failed to fetch grocery items');
      }
    },
    
    fetchCurrentUser: async () => {
      try {
        const user = await getCurrentUser();
        set({ currentUser: user });
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    },
    
    addItem: async (itemData) => {
      try {
        const { name, completed, quantity, unit } = itemData;
        
        // Use provided category or let Supabase auto-categorize
        let category = itemData.category;
        
        if (!category) {
          // Call the database function to categorize the item
          const { data, error: funcError } = await supabase
            .rpc('categorize_item', { item_name: name });
            
          if (funcError) {
            throw funcError;
          }
          
          category = data as CategoryType;
        }
        
        // Insert the new item
        const { data: newItem, error } = await supabase
          .from('items')
          .insert({
            name,
            category,
            completed: completed || false,
            quantity,
            unit,
            added_by: get().currentUser.name
          })
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        // The fetchItems will be triggered automatically by the realtime subscription
        toast.success(`Added ${name} to your grocery list`);
      } catch (error) {
        console.error('Error adding item:', error);
        toast.error('Failed to add item to your grocery list');
      }
    },
    
    toggleItem: async (id) => {
      try {
        const item = get().items.find(item => item.id === id);
        
        if (!item) {
          throw new Error('Item not found');
        }
        
        const completed = !item.completed;
        
        const { error } = await supabase
          .from('items')
          .update({
            completed,
            completed_by: completed ? get().currentUser.name : null,
            completed_at: completed ? new Date().toISOString() : null
          })
          .eq('id', id);
          
        if (error) {
          throw error;
        }
        
        // The fetchItems will be triggered automatically by the realtime subscription
      } catch (error) {
        console.error('Error toggling item:', error);
        toast.error('Failed to update item status');
      }
    },
    
    removeItem: async (id) => {
      try {
        const { error } = await supabase
          .from('items')
          .delete()
          .eq('id', id);
          
        if (error) {
          throw error;
        }
        
        // The fetchItems will be triggered automatically by the realtime subscription
        toast.success('Item removed from your grocery list');
      } catch (error) {
        console.error('Error removing item:', error);
        toast.error('Failed to remove item from your grocery list');
      }
    },
    
    updateItemQuantity: async (id, quantity) => {
      try {
        const item = get().items.find(item => item.id === id);
        
        if (!item) {
          throw new Error('Item not found');
        }
        
        const { error } = await supabase
          .from('items')
          .update({ quantity })
          .eq('id', id);
          
        if (error) {
          throw error;
        }
        
        // The fetchItems will be triggered automatically by the realtime subscription
      } catch (error) {
        console.error('Error updating item quantity:', error);
        toast.error('Failed to update item quantity');
      }
    },
    
    setUserName: async (name) => {
      const success = await setUserName(name);
      if (success) {
        set(state => ({
          currentUser: { ...state.currentUser, name }
        }));
      }
    }
  };
});

// Function to get category by ID
export const getCategoryById = (categoryId: CategoryType): CategoryDefinition => {
  return categories.find(category => category.id === categoryId) || categories[0]; // Return 'unknown' as default
};
