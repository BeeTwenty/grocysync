
export type CategoryType = 
  | 'unknown'
  | 'baby'
  | 'household'
  | 'snacks'
  | 'frozen'
  | 'beverages'
  | 'pets'
  | 'utensils'
  | 'canned'
  | 'checkout'
  | 'easter'
  | 'spices'
  | 'hygiene'
  | 'dry_goods'
  | 'bakery'
  | 'dairy'
  | 'fruit'
  | 'supplements'
  | 'spreads'
  | 'sauce'
  | 'meat'
  | 'misc'
  | 'herbs'
  | 'vegetables'
  | 'produce'  // Added for categorization
  | 'pantry'   // Added for categorization
  | 'other';   // Added for categorization

export interface GroceryItem {
  id: string;
  name: string;
  category: CategoryType;
  completed: boolean;
  quantity?: number;
  unit?: string; // Kept for backward compatibility but not used in UI
  addedBy: string;
  addedAt: Date;
  completedBy?: string;
  completedAt?: Date;
}

export interface CategoryDefinition {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
}
