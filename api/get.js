import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      CREATE TABLE IF NOT EXISTS calendar (
        date TEXT PRIMARY KEY,
        cja  TEXT,
        lla  TEXT,
        ticket BOOLEAN DEFAULT false,
        note TEXT
      )
    `;
    const rows = await sql`SELECT * FROM calendar`;
    const days = {};
    for (const r of rows) {
      days[r.date] = {};
      if (r.cja)    days[r.date].cja    = r.cja;
      if (r.lla)    days[r.date].lla    = r.lla;
      if (r.ticket) days[r.date].ticket = true;
      if (r.note)   days[r.date].note   = r.note;
    }
    res.status(200).json({ days });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
