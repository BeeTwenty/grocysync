
import { CategoryType } from "@/types/grocery";
import { supabase } from "@/integrations/supabase/client";

/**
 * Find a category in the database from previous categorizations
 * 
 * @param itemName The lowercase item name to search for
 * @returns Promise with the category ID or null if not found
 */
export async function findCategoryInDatabase(itemName: string): Promise<CategoryType | null> {
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
}

/**
 * Learn a categorization for future use
 * 
 * @param keyword The keyword to associate with a category
 * @param categoryId The category ID to associate with the keyword
 */
export async function learnCategorization(keyword: string, categoryId: CategoryType): Promise<void> {
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
}

/**
 * Learn a full item name categorization
 * 
 * @param itemName The complete item name to categorize
 * @param categoryId The category ID for the item
 */
export async function learnItemCategorization(itemName: string, categoryId: CategoryType): Promise<void> {
  if (!itemName.trim()) return;
  
  // Store the full item name as a keyword for exact matching
  await learnCategorization(itemName.trim(), categoryId);
  
  // Also store individual significant words
  const words = itemName.toLowerCase().trim().split(/\s+/);
  for (const word of words) {
    // Only learn words that are at least 3 characters
    if (word.length >= 3) {
      await learnCategorization(word, categoryId);
    }
  }
}
