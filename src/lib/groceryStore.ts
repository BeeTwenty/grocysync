
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { GroceryItem, CategoryType, CategoryDefinition } from '../types/grocery';
import { CategorizationService } from './categorizationService';

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

// Create a WebSocket connection for real-time updates
const setupWebSocket = (setState: any) => {
  // In a real implementation, we'd connect to a WebSocket server
  // For this demo, we'll simulate real-time updates
  
  // Mock receiving updates every few seconds (for demo purposes)
  const mockWebSocketInterval = setInterval(() => {
    // Simulated random update from another user
    if (Math.random() > 0.7) {
      const randomUser = Math.random() > 0.5 ? 'Alex' : 'Jamie';
      console.log(`Simulated update from ${randomUser}`);
      // We'd handle real updates here
    }
  }, 10000);

  return () => {
    clearInterval(mockWebSocketInterval);
  };
};

// For demo purposes, generate some example grocery items
const generateExampleItems = (): GroceryItem[] => {
  return [
    {
      id: uuidv4(),
      name: 'Milk',
      category: 'dairy',
      completed: false,
      quantity: 1,
      unit: 'gallon',
      addedBy: 'Alex',
      addedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: uuidv4(),
      name: 'Apples',
      category: 'produce',
      completed: false,
      quantity: 6,
      addedBy: 'Jamie',
      addedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      id: uuidv4(),
      name: 'Bread',
      category: 'bakery',
      completed: true,
      quantity: 1,
      unit: 'loaf',
      addedBy: 'Alex',
      addedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
      completedBy: 'Jamie',
      completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ];
};

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
  addItem: (item: Omit<GroceryItem, 'id' | 'addedBy' | 'addedAt' | 'category'> & { category?: CategoryType }) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  setUserName: (name: string) => void;
}

export const useGroceryStore = create<GroceryState>((set, get) => {
  // Initialize WebSocket connection for real-time updates
  const cleanupWebSocket = setupWebSocket(set);

  return {
    items: generateExampleItems(),
    currentUser: getCurrentUser(),
    isLoading: false,
    error: null,
    
    addItem: (itemData) => {
      set(state => {
        // Auto-categorize the item if category isn't provided
        const category = itemData.category || CategorizationService.categorizeItem(itemData.name);
        
        const newItem: GroceryItem = {
          id: uuidv4(),
          ...itemData,
          category,
          addedBy: state.currentUser.name,
          addedAt: new Date(),
          completed: false,
        };
        
        // Simulate storing in backend
        CategorizationService.storeItemInBackend(newItem)
          .then(() => {
            console.log('Item successfully added to backend');
          })
          .catch(error => {
            console.error('Failed to add item to backend:', error);
          });
        
        return {
          items: [...state.items, newItem]
        };
      });
    },
    
    toggleItem: (id) => {
      set(state => {
        const updatedItems = state.items.map(item => {
          if (item.id === id) {
            const completed = !item.completed;
            return {
              ...item,
              completed,
              completedBy: completed ? state.currentUser.name : undefined,
              completedAt: completed ? new Date() : undefined,
            };
          }
          return item;
        });
        
        // In a real implementation, we'd send this update to the backend
        return { items: updatedItems };
      });
    },
    
    removeItem: (id) => {
      set(state => ({
        items: state.items.filter(item => item.id !== id)
      }));
      
      // In a real implementation, we'd send this update to the backend
    },
    
    setUserName: (name) => {
      setUserName(name);
      set(state => ({
        currentUser: { ...state.currentUser, name }
      }));
    }
  };
});

// Cleanup WebSocket on app unmount
window.addEventListener('beforeunload', () => {
  // Cleanup WebSocket connection
});

// Function to get category by ID
export const getCategoryById = (categoryId: CategoryType): CategoryDefinition => {
  return categories.find(category => category.id === categoryId) || categories[categories.length - 1];
};
