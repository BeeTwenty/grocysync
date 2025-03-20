
import { create } from 'zustand';
import { GroceryItem, CategoryType } from '../types/grocery';
import { toast } from 'sonner';
import { GroceryState } from './store/types';
import { categories } from './store/categories';
import { getCurrentUser, setUserName as updateUserName } from './store/userProfile';
import { ItemsService, CategoriesService } from '@/services/api';

// Export categories for backward compatibility
export { categories };
export { setUserName } from './store/userProfile';
// Export getCategoryById function from categories
export { getCategoryById } from './store/categories';

// Setup websocket for real-time updates
let socket: WebSocket | null = null;

const setupWebsocket = (onMessage: (data: any) => void) => {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';
  
  if (socket !== null) {
    return () => {
      if (socket) {
        socket.close();
        socket = null;
      }
    };
  }
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed');
    // Optional: attempt to reconnect
  };
  
  return () => {
    if (socket) {
      socket.close();
      socket = null;
    }
  };
};

export const useGroceryStore = create<GroceryState>((set, get) => {
  // Set up websocket connection for real-time updates
  const cleanup = setupWebsocket((data) => {
    if (data.type === 'INSERT') {
      set((state) => ({
        items: [data.item, ...state.items]
      }));
    } else if (data.type === 'UPDATE') {
      set((state) => ({
        items: state.items.map(item => 
          item.id === data.item.id ? data.item : item
        )
      }));
    } else if (data.type === 'DELETE') {
      set((state) => ({
        items: state.items.filter(item => item.id !== data.id)
      }));
    }
  });

  return {
    items: [],
    currentUser: { id: 'user1', name: 'You' },
    isLoading: true,
    error: null,
    
    fetchItems: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const items = await ItemsService.getItems();
        
        // Transform items to match our app format
        const transformedItems = items.map((item: any): GroceryItem => ({
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
        
        // Use provided category or auto-categorize
        let category = itemData.category;
        
        if (!category) {
          // Call the API to categorize the item
          category = await CategoriesService.categorizeItem(name);
        }
        
        // Insert the new item
        await ItemsService.addItem({
          name,
          category,
          completed: completed || false,
          quantity,
          unit
        });
        
        toast.success(`Added ${name} to your grocery list`);
      } catch (error) {
        console.error('Error adding item:', error);
        toast.error('Failed to add item to your grocery list');
      }
    },
    
    toggleItem: async (id) => {
      try {
        await ItemsService.toggleItem(id);
      } catch (error) {
        console.error('Error toggling item:', error);
        toast.error('Failed to update item status');
      }
    },
    
    removeItem: async (id) => {
      try {
        // Optimistically update the UI
        const prevItems = get().items;
        
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }));
        
        await ItemsService.removeItem(id);
        toast.success('Item removed from your grocery list');
      } catch (error) {
        // Revert the optimistic update
        get().fetchItems();
        
        console.error('Error removing item:', error);
        toast.error('Failed to remove item from your grocery list');
      }
    },
    
    updateItemQuantity: async (id, quantity) => {
      try {
        await ItemsService.updateItemQuantity(id, quantity);
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
