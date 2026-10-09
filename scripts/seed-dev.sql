WITH u AS (
  INSERT INTO users (email, password_hash, time_zone)
  VALUES ('test@example.com', 'placeholder-not-a-real-hash', 'America/Denver')
  RETURNING id
)
INSERT INTO locations (user_id, name, is_primary)
SELECT id, 'My Home', true FROM u
RETURNING user_id;