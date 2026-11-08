ALTER TABLE equipment ADD COLUMN "archivedAt" timestamptz;
ALTER TABLE receipts ADD COLUMN "archivedAt" timestamptz;
ALTER TABLE issues ADD COLUMN "archivedAt" timestamptz;
ALTER TABLE faults ADD COLUMN "archivedAt" timestamptz;
ALTER TABLE movements ADD COLUMN "archivedAt" timestamptz;
