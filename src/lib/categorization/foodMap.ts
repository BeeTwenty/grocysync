
import { CategoryType } from "@/types/grocery";

// Food items mapped to their categories
export const foodCategoryMap: Record<string, CategoryType> = {
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
