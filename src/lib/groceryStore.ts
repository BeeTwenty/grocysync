
import { create } from 'zustand';
import { GroceryItem, CategoryType, CategoryDefinition } from '../types/grocery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define categories with their properties
export const categories: CategoryDefinition[] = [
  { id: 'produce', name: 'Produce', icon: 'apple', color: 'bg-category-produce' },
  { id: 'dairy', name: 'Dairy & Eggs', icon: 'milk', color: 'bg-category-dairy' },
  { id: 'meat', name: 'Meat & Seafood', icon: 'fish', color: 'bg-category-meat' },
  { id: 'bakery', name: 'Bakery', icon: 'cherry', color: 'bg-category-bakery' },
  { id: 'pantry', name: 'Pantry', icon: 'utensils', color: 'bg-category-pantry' },
  { id: 'frozen', name: 'Frozen', icon: 'lemon', color: 'bg-category-frozen' },
  { id: 'household', name: 'Household', icon: 'shopping-bag', color: 'bg-category-household' },
  { id: 'other', name: 'Other', icon: 'tag', color: 'bg-category-other' },
];

// Get current user - in a real app, this would come from authentication
const getCurrentUser = () => {
  return {
    id: 'user1',
    name: localStorage.getItem('userName') || 'You'
  };
};

// Store the user name in localStorage
export const setUserName = (name: string) => {
  localStorage.setItem('userName', name);
};

interface GroceryState {
  items: GroceryItem[];
  currentUser: { id: string; name: string };
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<GroceryItem, 'id' | 'addedBy' | 'addedAt' | 'category'> & { category?: CategoryType }) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  setUserName: (name: string) => void;
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
    currentUser: getCurrentUser(),
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
    
    setUserName: (name) => {
      setUserName(name);
      set(state => ({
        currentUser: { ...state.currentUser, name }
      }));
    }
  };
});

// Function to get category by ID
export const getCategoryById = (categoryId: CategoryType): CategoryDefinition => {
  return categories.find(category => category.id === categoryId) || categories[categories.length - 1];
};
