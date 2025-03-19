
import { CategoryType } from "@/types/grocery";

// Food items mapped to their categories
const foodCategoryMap: Record<string, CategoryType> = {
  // Produce items
  apple: "produce",
  banana: "produce",
  orange: "produce",
  grape: "produce",
  lettuce: "produce",
  tomato: "produce",
  cucumber: "produce",
  carrot: "produce",
  broccoli: "produce",
  spinach: "produce",
  kale: "produce",
  onion: "produce",
  potato: "produce",
  avocado: "produce",
  strawberry: "produce",
  blueberry: "produce",
  raspberry: "produce",
  
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
  rice: "pantry",
  pasta: "pantry",
  cereal: "pantry",
  flour: "pantry",
  sugar: "pantry",
  oil: "pantry",
  vinegar: "pantry",
  soup: "pantry",
  sauce: "pantry",
  beans: "pantry",
  nuts: "pantry",
  peanut: "pantry",
  chips: "pantry",
  snack: "pantry",
  
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
  
  // Default to other
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
    
    // Default to "other" if no match is found
    console.log(`Could not categorize "${itemName}", defaulting to "other"`);
    return "other";
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
