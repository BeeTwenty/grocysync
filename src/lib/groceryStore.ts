
import { create } from 'zustand';
import { GroceryItem, CategoryType } from '../types/grocery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GroceryState } from './store/types';
import { categories, getCategoryById } from './store/categories';
import { getCurrentUser, setUserName as updateUserName } from './store/userProfile';
import { fetchItemsFromDB, setupRealtimeSubscription, transformDatabaseItem } from './store/itemOperations';

// Export categories and getCategoryById for backward compatibility
export { categories, getCategoryById };
export { setUserName } from './store/userProfile';

export const useGroceryStore = create<GroceryState>((set, get) => {
  // Set up realtime subscription when the store is created
  const cleanup = setupRealtimeSubscription(
    // Handle INSERT
    (newItem) => {
      set((state) => ({
        items: [newItem, ...state.items]
      }));
    },
    // Handle UPDATE
    (updatedItem) => {
      set((state) => ({
        items: state.items.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      }));
    },
    // Handle DELETE
    (id) => {
      set((state) => ({
        items: state.items.filter(item => item.id !== id)
      }));
    }
  );

  return {
    items: [],
    currentUser: { id: 'user1', name: 'You' },
    isLoading: true,
    error: null,
    
    fetchItems: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const items = await fetchItemsFromDB();
        set({ items, isLoading: false });
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
        // We'll optimistically update the UI first
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }));
        
        const { error } = await supabase
          .from('items')
          .delete()
          .eq('id', id);
          
        if (error) {
          throw error;
        }
        
        // No need to refetch as the realtime subscription will handle this
        toast.success('Item removed from your grocery list');
      } catch (error) {
        console.error('Error removing item:', error);
        toast.error('Failed to remove item from your grocery list');
        
        // Revert the optimistic update if there was an error
        get().fetchItems();
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
      const success = await updateUserName(name);
      if (success) {
        set(state => ({
          currentUser: { ...state.currentUser, name }
        }));
      }
    }
  };
});
