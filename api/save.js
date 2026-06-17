import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { date, cja, lla, ticket, note, _delete } = req.body;

    if (!date) return res.status(400).json({ error: 'date required' });

    if (_delete) {
      await sql`DELETE FROM calendar WHERE date = ${date}`;
    } else {
      await sql`
        INSERT INTO calendar (date, cja, lla, ticket, note)
        VALUES (${date}, ${cja||null}, ${lla||null}, ${ticket||false}, ${note||null})
        ON CONFLICT (date) DO UPDATE SET
          cja    = EXCLUDED.cja,
          lla    = EXCLUDED.lla,
          ticket = EXCLUDED.ticket,
          note   = EXCLUDED.note
      `;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
