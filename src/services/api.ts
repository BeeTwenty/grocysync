import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Store token in localStorage
const setToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const removeToken = () => {
  localStorage.removeItem('auth_token');
};

// Check if user is logged in
const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Fetch with authentication
const authFetch = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        // Clear token and redirect to login
        removeToken();
        window.location.href = '/auth';
      }
      
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth services
export const AuthService = {
  signIn: async (email: string, password: string) => {
    try {
      const data = await authFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      setToken(data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      return await authFetch('/profiles/me');
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },
  
  signUp: async (email: string, password: string, displayName: string) => {
    try {
      const data = await authFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName })
      });
      
      setToken(data.token);
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  signOut: () => {
    removeToken();
    window.location.href = '/auth';
  },
  
  updatePassword: async (currentPassword: string, newPassword: string, userId: string) => {
    try {
      return await authFetch('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword, userId })
      });
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  },
  
  isAuthenticated,
  getToken
};

// Grocery items services
export const ItemsService = {
  getItems: async () => {
    try {
      return await authFetch('/items');
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to fetch grocery items');
      throw error;
    }
  },
  
  addItem: async (itemData: any) => {
    try {
      return await authFetch('/items', {
        method: 'POST',
        body: JSON.stringify(itemData)
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item to your grocery list');
      throw error;
    }
  },
  
  toggleItem: async (id: string) => {
    try {
      return await authFetch(`/items/${id}/toggle`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Failed to update item status');
      throw error;
    }
  },
  
  updateItemQuantity: async (id: string, quantity: number) => {
    try {
      return await authFetch(`/items/${id}/quantity`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });
    } catch (error) {
      console.error('Error updating item quantity:', error);
      toast.error('Failed to update item quantity');
      throw error;
    }
  },
  
  removeItem: async (id: string) => {
    try {
      return await authFetch(`/items/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from your grocery list');
      throw error;
    }
  }
};

// Categories services
export const CategoriesService = {
  getCategories: async () => {
    try {
      return await authFetch('/categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  categorizeItem: async (itemName: string) => {
    try {
      const data = await authFetch('/categories/categorize', {
        method: 'POST',
        body: JSON.stringify({ itemName })
      });
      return data.category;
    } catch (error) {
      console.error('Error categorizing item:', error);
      return 'unknown';
    }
  },
  
  learnCategorization: async (keyword: string, categoryId: string) => {
    try {
      return await authFetch('/categories/keywords', {
        method: 'POST',
        body: JSON.stringify({ keyword, categoryId })
      });
    } catch (error) {
      console.error('Error learning categorization:', error);
    }
  }
};

// Profile services
export const ProfileService = {
  getCurrentUser: async () => {
    try {
      return await authFetch('/profiles/me');
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  updateDisplayName: async (displayName: string) => {
    try {
      return await authFetch('/profiles/display-name', {
        method: 'PUT',
        body: JSON.stringify({ displayName })
      });
    } catch (error) {
      console.error('Error updating display name:', error);
      toast.error('Failed to update display name');
      throw error;
    }
  }
};

export default {
  auth: AuthService,
  items: ItemsService,
  categories: CategoriesService,
  profile: ProfileService
};
