INSERT INTO outages (user_id, location_id, started_at, ended_at, note)
SELECT l.user_id, l.id, v.started_at, v.ended_at, v.note
FROM locations l
CROSS JOIN (VALUES
  (now() - interval '2 days',  now() - interval '2 days'  + interval '3 hours', 'Storm'),
  (now() - interval '9 hours', now() - interval '7 hours',                      NULL),
  (now() - interval '1 hour',  NULL::timestamptz,                               'Still out')
) AS v(started_at, ended_at, note)
WHERE l.user_id = '4f7e6298-d802-40ee-ae78-1496241cb899' AND l.is_primary
RETURNING id;