
import express from 'express';
import { pool } from '../index';

const router = express.Router();

// Get current user profile
router.get('/me', async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update display name
router.put('/display-name', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { displayName } = req.body;
    
    if (!displayName) {
      return res.status(400).json({ error: 'Display name is required' });
    }
    
    const result = await pool.query(
      'UPDATE profiles SET display_name = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
      [displayName, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating display name:', error);
    res.status(500).json({ error: 'Failed to update display name' });
  }
});

export default router;
