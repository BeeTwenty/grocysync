
import { CategoryType } from "@/types/grocery";

// Food items mapped to their categories
const foodCategoryMap: Record<string, CategoryType> = {
  // Produce items
  apple: "fruit",
  banana: "fruit",
  orange: "fruit",
  grape: "fruit",
  lettuce: "vegetables",
  tomato: "vegetables",
  cucumber: "vegetables",
  carrot: "vegetables",
  broccoli: "vegetables",
  spinach: "vegetables",
  kale: "vegetables",
  onion: "vegetables",
  potato: "vegetables",
  avocado: "vegetables",
  strawberry: "fruit",
  blueberry: "fruit",
  raspberry: "fruit",
  
  // Dairy items
  milk: "dairy",
  cheese: "dairy",
  yogurt: "dairy",
  butter: "dairy",
  cream: "dairy",
  egg: "dairy",
  eggs: "dairy",
  
  // Meat and seafood
  chicken: "meat",
  beef: "meat",
  pork: "meat",
  fish: "meat",
  salmon: "meat",
  tuna: "meat",
  shrimp: "meat",
  steak: "meat",
  ground: "meat",
  
  // Bakery
  bread: "bakery",
  bagel: "bakery",
  muffin: "bakery",
  cake: "bakery",
  cookie: "bakery",
  pastry: "bakery",
  croissant: "bakery",
  
  // Pantry
  rice: "dry_goods",
  pasta: "dry_goods",
  cereal: "dry_goods",
  flour: "dry_goods",
  sugar: "dry_goods",
  oil: "dry_goods",
  vinegar: "dry_goods",
  soup: "canned",
  sauce: "sauce",
  beans: "canned",
  nuts: "snacks",
  peanut: "snacks",
  chips: "snacks",
  snack: "snacks",
  
  // Frozen
  icecream: "frozen",
  pizza: "frozen",
  frozen: "frozen",
  
  // Household
  soap: "household",
  detergent: "household",
  paper: "household",
  toilet: "household",
  tissue: "household",
  cleaner: "household",
  trash: "household",
  bag: "household",
  
  // Default to unknown
};

/**
 * Service to categorize grocery items based on their names
 */
export const CategorizationService = {
  /**
   * Automatically categorize an item based on its name
   * 
   * @param itemName The name of the grocery item to categorize
   * @returns The category ID for the item
   */
  categorizeItem(itemName: string): CategoryType {
    // Convert to lowercase for easier matching
    const nameLower = itemName.toLowerCase();
    
    // Try to find a match from our mapping
    for (const [keyword, category] of Object.entries(foodCategoryMap)) {
      if (nameLower.includes(keyword)) {
        console.log(`Categorized "${itemName}" as "${category}" based on keyword "${keyword}"`);
        return category;
      }
    }
    
    // Default to "unknown" if no match is found
    console.log(`Could not categorize "${itemName}", defaulting to "unknown"`);
    return "unknown";
  },
  
  /**
   * Mock function to simulate sending the item to a backend
   */
  async storeItemInBackend(item: any): Promise<void> {
    // In a real implementation, this would be an API call
    console.log("Storing item in backend:", item);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate success
    console.log("Item successfully stored in backend");
    return Promise.resolve();
  }
};
