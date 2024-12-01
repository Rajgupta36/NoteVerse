/*
  Warnings:

  - Added the required column `lastModifiedAt` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "lastModifiedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
