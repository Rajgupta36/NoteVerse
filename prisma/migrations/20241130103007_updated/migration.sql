/*
  Warnings:

  - You are about to drop the column `parentDocumentId` on the `Document` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_parentDocumentId_fkey";

-- DropIndex
DROP INDEX "Document_userId_parentDocumentId_idx";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "parentDocumentId",
ADD COLUMN     "childDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "parentDocument" TEXT;

-- CreateIndex
CREATE INDEX "Document_userId_parentDocument_idx" ON "Document"("userId", "parentDocument");
