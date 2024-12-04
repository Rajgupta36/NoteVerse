-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "isCollaborative" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "isArchived" SET DEFAULT false,
ALTER COLUMN "isPublished" SET DEFAULT false;
