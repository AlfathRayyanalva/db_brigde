import { Pool } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Batasi hanya menerima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verifikasi Secret Key biar endpoint kamu aman dari orang lain
  const secretKey = req.headers['x-bridge-secret'];
  if (secretKey !== process.env.BRIDGE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { query, params } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(query, params || []);
    return res.status(200).json({ rows: result.rows, rowCount: result.rowCount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  } finally {
    await pool.end();
  }
}
