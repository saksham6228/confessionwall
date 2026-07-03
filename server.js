// =============================================
//   server.js — Backend (Node.js + Express + MySQL)
// =============================================

const express = require('express');
const cors = require('cors');
const { connectWithRetry, getPool } = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// =============================================
//  API ROUTES
// =============================================

/**
 * GET /api/confessions
 * Returns all confessions, sorted by votes (most upvoted first).
 * Optional query param: ?category=Love to filter by category.
 */
app.get('/api/confessions', async (req, res) => {
  const { category } = req.query;
  try {
    const pool = getPool();
    let query = 'SELECT * FROM confessions';
    let params = [];

    if (category && category !== 'all') {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY votes DESC, created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching confessions:', err.message);
    res.status(500).json({ error: 'Failed to fetch confessions.' });
  }
});

/**
 * POST /api/confessions
 * Adds a new confession. Expects JSON body: { content, category }
 */
app.post('/api/confessions', async (req, res) => {
  const { content, category } = req.body;

  // --- VALIDATION ---
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Confession content cannot be empty.' });
  }
  if (content.trim().length < 5) {
    return res.status(400).json({ error: 'Confession must be at least 5 characters.' });
  }
  if (content.trim().length > 500) {
    return res.status(400).json({ error: 'Confession must be under 500 characters.' });
  }

  const validCategories = ['Campus Life', 'Love', 'Academics', 'Random'];
  const finalCategory = validCategories.includes(category) ? category : 'Random';

  try {
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO confessions (content, category) VALUES (?, ?)',
      [content.trim(), finalCategory]
    );
    res.status(201).json({ id: result.insertId, message: 'Confession posted successfully.' });
  } catch (err) {
    console.error('Error posting confession:', err.message);
    res.status(500).json({ error: 'Failed to post confession.' });
  }
});

/**
 * PUT /api/confessions/:id/upvote
 * Increments the vote count for a confession.
 */
app.put('/api/confessions/:id/upvote', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    const [existing] = await pool.query('SELECT * FROM confessions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Confession not found.' });
    }

    await pool.query('UPDATE confessions SET votes = votes + 1 WHERE id = ?', [id]);
    res.json({ message: 'Upvoted successfully.' });
  } catch (err) {
    console.error('Error upvoting confession:', err.message);
    res.status(500).json({ error: 'Failed to upvote.' });
  }
});

/**
 * PUT /api/confessions/:id/downvote
 * Decrements the vote count for a confession (won't go below 0).
 */
app.put('/api/confessions/:id/downvote', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    const [existing] = await pool.query('SELECT * FROM confessions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Confession not found.' });
    }

    await pool.query('UPDATE confessions SET votes = GREATEST(votes - 1, 0) WHERE id = ?', [id]);
    res.json({ message: 'Downvoted successfully.' });
  } catch (err) {
    console.error('Error downvoting confession:', err.message);
    res.status(500).json({ error: 'Failed to downvote.' });
  }
});

/**
 * GET /api/health
 * Health check endpoint — confirms both the backend and its
 * database connection are alive. Useful for docker-compose
 * healthchecks tomorrow.
 */
app.get('/api/health', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// =============================================
//  ERROR HANDLING FOR UNKNOWN ROUTES
// =============================================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// =============================================
//  START SERVER (only after DB connection succeeds)
// =============================================
async function start() {
  await connectWithRetry();
  app.listen(PORT, () => {
    console.log(`Confession Wall backend running at http://localhost:${PORT}`);
  });
}

start();
