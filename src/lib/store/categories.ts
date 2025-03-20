
import { CategoryType, CategoryDefinition } from '@/types/grocery';

// Define categories with their properties
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

// Function to get category by ID
export const getCategoryById = (categoryId: CategoryType): CategoryDefinition => {
  return categories.find(category => category.id === categoryId) || categories[0]; // Return 'unknown' as default
};
