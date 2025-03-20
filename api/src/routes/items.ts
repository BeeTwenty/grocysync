
import express from 'express';
import { pool } from '../index';

const router = express.Router();

// Get all items
router.get('/', async (req: any, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM items ORDER BY added_at DESC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Add new item
router.post('/', async (req: any, res) => {
  try {
    const { name, category, completed, quantity, unit } = req.body;
    const user = req.user;
    
    // Get display name for added_by
    const profileResult = await pool.query(
      'SELECT display_name FROM profiles WHERE user_id = $1',
      [user.id]
    );
    
    const displayName = profileResult.rows[0]?.display_name || 'Unknown user';
    
    const result = await pool.query(
      `INSERT INTO items 
       (name, category, completed, quantity, unit, added_by, added_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [name, category || 'unknown', completed || false, quantity, unit, displayName]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Toggle item completion
router.put('/:id/toggle', async (req: any, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Get display name for completed_by
    const profileResult = await pool.query(
      'SELECT display_name FROM profiles WHERE user_id = $1',
      [user.id]
    );
    
    const displayName = profileResult.rows[0]?.display_name || 'Unknown user';
    
    // First get current item state
    const itemResult = await pool.query(
      'SELECT completed FROM items WHERE id = $1',
      [id]
    );
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const currentCompleted = itemResult.rows[0].completed;
    const newCompleted = !currentCompleted;
    
    // Update the item
    const result = await pool.query(
      `UPDATE items 
       SET completed = $1, 
           completed_by = $2, 
           completed_at = $3 
       WHERE id = $4 
       RETURNING *`,
      [
        newCompleted, 
        newCompleted ? displayName : null, 
        newCompleted ? new Date() : null, 
        id
      ]
    );
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling item:', error);
    res.status(500).json({ error: 'Failed to toggle item' });
  }
});

// Update item quantity
router.put('/:id/quantity', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    const result = await pool.query(
      'UPDATE items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ error: 'Failed to update item quantity' });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
