
import express from 'express';
import { pool } from '../index';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get keywords for categories
router.get('/keywords', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM keyword_categories');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching category keywords:', error);
    res.status(500).json({ error: 'Failed to fetch category keywords' });
  }
});

// Add new keyword-category mapping
router.post('/keywords', async (req, res) => {
  try {
    const { keyword, categoryId } = req.body;
    
    if (!keyword || keyword.length < 3) {
      return res.status(400).json({ error: 'Keyword must be at least 3 characters' });
    }
    
    // Check if this pair already exists
    const checkResult = await pool.query(
      'SELECT id FROM keyword_categories WHERE keyword = $1 AND category_id = $2',
      [keyword.toLowerCase(), categoryId]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(200).json({ message: 'Keyword-category pair already exists' });
    }
    
    // Insert new pair
    const result = await pool.query(
      'INSERT INTO keyword_categories (keyword, category_id) VALUES ($1, $2) RETURNING *',
      [keyword.toLowerCase(), categoryId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding category keyword:', error);
    res.status(500).json({ error: 'Failed to add category keyword' });
  }
});

// Categorize item
router.post('/categorize', async (req, res) => {
  try {
    const { itemName } = req.body;
    const nameLower = itemName.toLowerCase();
    
    // Try to find a keyword match
    const result = await pool.query(
      `SELECT kc.category_id 
       FROM keyword_categories kc 
       WHERE $1 LIKE '%' || kc.keyword || '%' 
       LIMIT 1`,
      [nameLower]
    );
    
    // Default to 'unknown' if no match found
    const categoryId = result.rows.length > 0 ? result.rows[0].category_id : 'unknown';
    
    res.status(200).json({ category: categoryId });
  } catch (error) {
    console.error('Error categorizing item:', error);
    res.status(500).json({ error: 'Failed to categorize item' });
  }
});

export default router;
