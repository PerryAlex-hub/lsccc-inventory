BEGIN;

ALTER TABLE "audit_events" ADD COLUMN "actorName" TEXT;

UPDATE "audit_events" AS event
SET "actorName" = account.name
FROM users AS account
WHERE event."actorId" = account.id;

ALTER TABLE "audit_events" DROP CONSTRAINT "audit_events_actorId_fkey";
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES users(id) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "mutation_requests" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "mutation_requests" DROP CONSTRAINT "mutation_requests_userId_fkey";
ALTER TABLE "mutation_requests" ADD CONSTRAINT "mutation_requests_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL ON UPDATE NO ACTION;

COMMIT;
