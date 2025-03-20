
import { CategoryType, CategoryDefinition, GroceryItem } from '@/types/grocery';

export interface GroceryState {
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
