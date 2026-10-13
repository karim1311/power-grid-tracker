import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/seed.mjs');
}

const sql = neon(process.env.DATABASE_URL);
const hash = await bcrypt.hash('password', 10);

// Re-runnable: deleting the user cascades to their locations and outages.
await sql`DELETE FROM users WHERE email = 'test@test.com'`;

// Dates are relative to "now" in America/Denver, so the data always looks fresh.
// Columns: location, days ago, start hour, start minute, duration (min), note
await sql`
WITH u AS (
  INSERT INTO users (email, password_hash, time_zone)
  VALUES ('test@test.com', ${hash}::text, 'America/Denver')
  RETURNING id
),
loc AS (
  INSERT INTO locations (user_id, name, is_primary)
  SELECT u.id, v.name, v.is_primary
  FROM u, (VALUES ('My Home', true), ('My Office', false)) AS v(name, is_primary)
  RETURNING id, user_id, name
),
ongoing AS (
  INSERT INTO outages (user_id, location_id, started_at, ended_at, note)
  SELECT loc.user_id, loc.id, now() - interval '45 minutes', NULL::timestamptz,
         'Power went out a little while ago.'
  FROM loc WHERE loc.name = 'My Home'
)
INSERT INTO outages (user_id, location_id, started_at, ended_at, note)
SELECT user_id, location_id, started_at, started_at + make_interval(mins => dur), note
FROM (
  SELECT loc.user_id, loc.id AS location_id, d.dur, d.note,
    (((now() AT TIME ZONE 'America/Denver')::date - d.days_ago)
      + make_interval(hours => d.h, mins => d.m)) AT TIME ZONE 'America/Denver' AS started_at
  FROM loc
  JOIN (VALUES
    -- This month (13 outages, mostly evenings, one crossing midnight, one overlap)
    ('My Home',   1, 18, 20,  95, 'Storm, whole street was out'),
    ('My Home',   2, 19,  5,  40, NULL),
    ('My Home',   3, 18, 45, 130, 'Transformer problem'),
    ('My Home',   3, 18, 50,  60, 'Possible duplicate of the entry above'),
    ('My Home',   4, 19, 30,  25, NULL),
    ('My Home',   5,  7, 10,  60, 'Brief morning outage'),
    ('My Home',   6, 18, 10,  75, NULL),
    ('My Home',   7, 23, 30, 150, 'Crossed midnight'),
    ('My Home',   8, 19, 15,  55, NULL),
    ('My Home',   9, 12, 40,  30, NULL),
    ('My Home',  10, 18, 50, 110, 'High wind'),
    ('My Office',11, 18, 30,  45, NULL),
    ('My Office',12, 14,  0,  20, 'Maintenance'),
    -- Last month (fewer, so the dashboard shows an increase)
    ('My Home',  31, 19,  0,  60, NULL),
    ('My Home',  33, 18, 30,  90, NULL),
    ('My Home',  35,  8, 15,  45, NULL),
    ('My Home',  38, 19, 20, 120, NULL),
    ('My Home',  41, 18, 40,  50, NULL),
    -- Older history (all-time average, analytics pattern)
    ('My Home',  62, 18, 25,  80, NULL),
    ('My Home',  75, 19, 10, 100, NULL),
    ('My Home',  90, 18, 50,  65, NULL),
    ('My Home', 105, 13,  0,  35, NULL),
    ('My Home', 120, 19, 40,  90, NULL),
    ('My Home', 140, 18, 15,  70, NULL),
    ('My Home', 160, 21,  0,  50, NULL),
    -- Same month last year
    ('My Home', 369, 20,  0,  90, NULL),
    ('My Home', 374, 18, 30,  60, NULL)
  ) AS d(loc_name, days_ago, h, m, dur, note) ON d.loc_name = loc.name
) x
`;

const [{ total, ongoing }] = await sql`
  SELECT count(*)::int AS total, count(*) FILTER (WHERE ended_at IS NULL)::int AS ongoing
  FROM outages WHERE user_id = (SELECT id FROM users WHERE email = 'test@test.com')
`;
console.log(`Seeded test@test.com / password with ${total} outages (${ongoing} ongoing).`);