CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  time_zone     TEXT NOT NULL DEFAULT 'UTC',   -- IANA name, e.g. America/Denver
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                   -- "My Home", "My Office"
  utility_id  TEXT,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)                         -- target for outages' composite FK
);

-- At most one primary location per user.
CREATE UNIQUE INDEX IF NOT EXISTS one_primary_per_user
  ON locations (user_id) WHERE is_primary;

CREATE TABLE IF NOT EXISTS outages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  location_id UUID NOT NULL,
  started_at  TIMESTAMPTZ NOT NULL,
  ended_at    TIMESTAMPTZ,                     -- NULL = ongoing
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- An outage's owner must match its location's owner.
  FOREIGN KEY (location_id, user_id) REFERENCES locations (id, user_id) ON DELETE CASCADE,
  CHECK (ended_at IS NULL OR ended_at > started_at),
  CHECK (note IS NULL OR char_length(note) <= 500)
);