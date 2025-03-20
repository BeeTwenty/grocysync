import { CategoryType } from "@/types/grocery";
import { foodCategoryMap } from "./categorization/foodMap";
import { findCategoryInDatabase, learnCategorization, learnItemCategorization } from "./categorization/databaseOperations";

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
  categorizeItem(itemName: string): Promise<CategoryType> {
    // Convert to lowercase for case-insensitive matching
    const nameLower = itemName.toLowerCase().trim();
    
    // First try to find a match in the database from previous categorizations
    return findCategoryInDatabase(nameLower)
      .then(categoryFromDB => {
        if (categoryFromDB) {
          console.log(`Categorized "${itemName}" as "${categoryFromDB}" from database`);
          return categoryFromDB;
        }
        
        // Otherwise, try matching with the local map
        return this.findCategoryLocally(nameLower, itemName);
      })
      .catch(error => {
        console.error("Error accessing database for categorization:", error);
        // Fallback to local matching if database fails
        return this.findCategoryLocally(nameLower, itemName);
      });
  },
  
  /**
   * Find a category for an item using the local keyword map
   * 
   * @param nameLower The lowercase item name
   * @param originalName The original item name (for logging)
   * @returns The category ID for the item
   */
  findCategoryLocally(nameLower: string, originalName: string): CategoryType {
    // First try exact word matching in the item name
    const words = nameLower.split(/\s+/);
    for (const word of words) {
      if (foodCategoryMap[word]) {
        console.log(`Categorized "${originalName}" as "${foodCategoryMap[word]}" based on exact word "${word}"`);
        
        // Learn this categorization for future use
        learnCategorization(word, foodCategoryMap[word])
          .catch(error => console.error("Failed to save keyword categorization:", error));
        
        return foodCategoryMap[word];
      }
    }
    
    // If no exact word match, try to find a keyword within the name
    for (const [keyword, category] of Object.entries(foodCategoryMap)) {
      if (nameLower.includes(keyword)) {
        console.log(`Categorized "${originalName}" as "${category}" based on included keyword "${keyword}"`);
        
        // Learn this categorization for future use
        learnCategorization(keyword, category)
          .catch(error => console.error("Failed to save keyword categorization:", error));
        
        return category;
      }
    }
    
    // Default to "unknown" if no match is found
    console.log(`Could not categorize "${originalName}", defaulting to "unknown"`);
    return "unknown";
  },
  
  // Re-export database functions for ease of use
  findCategoryInDatabase,
  learnCategorization,
  learnItemCategorization,
  
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
