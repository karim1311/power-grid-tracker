# GridLog data decisions

The spec doesn't say how data is stored, so these are the decisions the schema and
`lib/` code are built on. Open a PR comment if you disagree with any of them.

| 1 | **Postgres** (e.g. Neon via Vercel) | Transactions, strong constraints, partial indexes. Needs confirming with whoever controls the Vercel account. |

| 2 | **Absolute timestamps** (`timestamptz`) for outage start/end; display time zone stored on the user | Spec: event instants must stay stable when the display time zone changes. |

| 3 | **Hard delete** for outages | Spec says deleted records are "removed" and users need control over false data. |

| 4 | **Summaries and charging guidance are computed on request**, not stored | Edits and deletes automatically stay consistent; no stale cached numbers. |

| 5 | **User 1:Many Location, Location 1:Many Outage.** Locations are personal ("My Home"). `is_primary` marks the one primary location per user. | Matches the spec's user-facing location names and "one primary location" rule. |

| 6 | **`outages.user_id` is kept alongside `location_id`**, tied together by a composite foreign key | Makes ownership scoping simple and impossible for the two to disagree. |

| 7 | **Duration and status are derived**, not stored columns | Can't drift out of sync after an edit. Ongoing = `ended_at IS NULL`. |

| 8 | **Overlaps are handled at calculation time** (intervals merged before summing), not blocked on write | Spec says overlaps must not be double counted; it doesn't say they must be rejected. Duplicates produce a warning. |

| 9 | **Future start/end times are rejected in application validation** (1 min clock-skew tolerance) | A SQL `CHECK` can't safely use `now()`. |

- Charging guidance calculation (FR-008).
- Password hashing and session mechanism.
- Data retention and backups.