
export type CategoryType = 
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'pantry'
  | 'frozen'
  | 'household'
  | 'other';

export interface GroceryItem {
  id: string;
  name: string;
  category: CategoryType;
  completed: boolean;
  quantity?: number;
  unit?: string;
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
