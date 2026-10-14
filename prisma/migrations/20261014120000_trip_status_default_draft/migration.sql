-- Align default Trip.status with AI-generated drafts (existing rows unchanged).
ALTER TABLE "Trip" ALTER COLUMN "status" SET DEFAULT 'draft';
