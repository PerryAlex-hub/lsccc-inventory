BEGIN;

CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('Administrator', 'Inventory officer')),
  active boolean NOT NULL DEFAULT true,
  "passwordHash" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sessions (
  "tokenHash" text PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user ON sessions("userId");
CREATE TABLE invitations (
  id uuid PRIMARY KEY,
  email text NOT NULL CHECK (email = lower(email)),
  role text NOT NULL CHECK (role IN ('Administrator', 'Inventory officer')),
  "tokenHash" text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "expiresAt" timestamptz NOT NULL,
  "consumedAt" timestamptz,
  "deliveryStatus" text NOT NULL DEFAULT 'pending' CHECK ("deliveryStatus" IN ('pending', 'sent', 'failed'))
);
CREATE UNIQUE INDEX invitations_pending ON invitations(email) WHERE "consumedAt" IS NULL;
CREATE TABLE password_resets (
  "tokenHash" text PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "expiresAt" timestamptz NOT NULL
);
CREATE TABLE rate_limits (
  key text PRIMARY KEY,
  attempts integer NOT NULL,
  "expiresAt" timestamptz NOT NULL
);
CREATE INDEX rate_limits_expiry ON rate_limits("expiresAt");
CREATE TABLE workspace (
  id integer PRIMARY KEY CHECK (id = 1),
  revision integer NOT NULL DEFAULT 0
);
INSERT INTO workspace(id) VALUES (1);
CREATE TABLE equipment (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  available integer NOT NULL CHECK (available >= 0),
  issued integer NOT NULL CHECK (issued >= 0),
  faulty integer NOT NULL CHECK (faulty >= 0 AND faulty <= issued),
  reorder integer NOT NULL CHECK (reorder >= 0)
);
CREATE UNIQUE INDEX equipment_unique_name ON equipment(lower(name));
CREATE TABLE receipts (
  id text PRIMARY KEY,
  "equipmentId" text NOT NULL REFERENCES equipment(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  supplier text NOT NULL,
  date timestamptz NOT NULL
);
CREATE TABLE issues (
  id text PRIMARY KEY,
  "equipmentId" text NOT NULL REFERENCES equipment(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  returned integer NOT NULL DEFAULT 0 CHECK (returned >= 0 AND returned <= quantity),
  assignee text NOT NULL,
  department text NOT NULL,
  date timestamptz NOT NULL
);
CREATE TABLE faults (
  id text PRIMARY KEY,
  "equipmentId" text NOT NULL REFERENCES equipment(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  title text NOT NULL,
  location text NOT NULL,
  custodian text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
  status text NOT NULL CHECK (status IN ('Reported', 'In progress', 'Resolved')),
  date timestamptz NOT NULL,
  "startedAt" timestamptz,
  "resolvedAt" timestamptz,
  "repairNotes" text,
  history jsonb NOT NULL DEFAULT '[]',
  CHECK ((status = 'Reported' AND "startedAt" IS NULL AND "resolvedAt" IS NULL) OR
         (status = 'In progress' AND "startedAt" IS NOT NULL AND "resolvedAt" IS NULL) OR
         (status = 'Resolved' AND "startedAt" IS NOT NULL AND "resolvedAt" IS NOT NULL AND "repairNotes" IS NOT NULL))
);
CREATE TABLE movements (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('Receipt', 'Issue', 'Fault', 'Repair')),
  "equipmentId" text NOT NULL REFERENCES equipment(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  description text NOT NULL,
  date timestamptz NOT NULL,
  actor text NOT NULL
);
CREATE TABLE audit_events (
  id uuid PRIMARY KEY,
  "actorId" uuid REFERENCES users(id),
  action text NOT NULL,
  "recordId" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE mutation_requests (
  key uuid PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES users(id),
  fingerprint text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

COMMIT;
