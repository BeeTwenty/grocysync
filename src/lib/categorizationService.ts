import { CategoryType } from "@/types/grocery";
import { supabase } from "@/integrations/supabase/client";

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

  // Beverages
  water: "beverages",
  juice: "beverages",
  soda: "beverages",
  pop: "beverages",
  coffee: "beverages",
  tea: "beverages",
  wine: "beverages",
  beer: "beverages",
  drink: "beverages",
  beverage: "beverages",
  
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
  bags: "household",
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
    // Convert to lowercase for case-insensitive matching
    const nameLower = itemName.toLowerCase().trim();
    
    // First try to find a match in the database from previous categorizations
    return this.findCategoryInDatabase(nameLower)
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
        this.learnCategorization(word, foodCategoryMap[word])
          .catch(error => console.error("Failed to save keyword categorization:", error));
        
        return foodCategoryMap[word];
      }
    }
    
    // If no exact word match, try to find a keyword within the name
    for (const [keyword, category] of Object.entries(foodCategoryMap)) {
      if (nameLower.includes(keyword)) {
        console.log(`Categorized "${originalName}" as "${category}" based on included keyword "${keyword}"`);
        
        // Learn this categorization for future use
        this.learnCategorization(keyword, category)
          .catch(error => console.error("Failed to save keyword categorization:", error));
        
        return category;
      }
    }
    
    // Default to "unknown" if no match is found
    console.log(`Could not categorize "${originalName}", defaulting to "unknown"`);
    return "unknown";
  },
  
  /**
   * Find a category in the database from previous categorizations
   * 
   * @param itemName The lowercase item name to search for
   * @returns Promise with the category ID or null if not found
   */
  async findCategoryInDatabase(itemName: string): Promise<CategoryType | null> {
    // Search for exact item name matches first
    const { data: exactMatches, error: exactError } = await supabase
      .from('keyword_categories')
      .select('category_id')
      .ilike('keyword', itemName)
      .limit(1);
    
    if (exactError) {
      console.error("Error searching for exact item match:", exactError);
      return null;
    }
    
    if (exactMatches && exactMatches.length > 0) {
      return exactMatches[0].category_id as CategoryType;
    }
    
    // If no exact match, search for keyword matches
    const { data: keywordMatches, error: keywordError } = await supabase
      .from('keyword_categories')
      .select('keyword, category_id');
    
    if (keywordError) {
      console.error("Error searching for keyword matches:", keywordError);
      return null;
    }
    
    if (keywordMatches) {
      // Find partial matches
      for (const entry of keywordMatches) {
        if (itemName.includes(entry.keyword.toLowerCase())) {
          return entry.category_id as CategoryType;
        }
      }
    }
    
    return null;
  },
  
  /**
   * Learn a categorization for future use
   * 
   * @param keyword The keyword to associate with a category
   * @param categoryId The category ID to associate with the keyword
   */
  async learnCategorization(keyword: string, categoryId: CategoryType): Promise<void> {
    // Only store keywords that are at least 3 characters
    if (keyword.length < 3) {
      return;
    }
    
    // Check if this keyword-category pair already exists
    const { data, error: searchError } = await supabase
      .from('keyword_categories')
      .select('id')
      .eq('keyword', keyword.toLowerCase())
      .eq('category_id', categoryId)
      .limit(1);
    
    if (searchError) {
      console.error("Error checking for existing keyword:", searchError);
      return;
    }
    
    // If the pair doesn't exist, insert it
    if (!data || data.length === 0) {
      const { error: insertError } = await supabase
        .from('keyword_categories')
        .insert({
          keyword: keyword.toLowerCase(),
          category_id: categoryId
        });
      
      if (insertError) {
        console.error("Error saving new keyword categorization:", insertError);
      } else {
        console.log(`Learned new categorization: "${keyword}" -> "${categoryId}"`);
      }
    }
  },
  
  /**
   * Learn a full item name categorization
   * 
   * @param itemName The complete item name to categorize
   * @param categoryId The category ID for the item
   */
  async learnItemCategorization(itemName: string, categoryId: CategoryType): Promise<void> {
    if (!itemName.trim()) return;
    
    // Store the full item name as a keyword for exact matching
    await this.learnCategorization(itemName.trim(), categoryId);
    
    // Also store individual significant words
    const words = itemName.toLowerCase().trim().split(/\s+/);
    for (const word of words) {
      // Only learn words that are at least 3 characters
      if (word.length >= 3) {
        await this.learnCategorization(word, categoryId);
      }
    }
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
