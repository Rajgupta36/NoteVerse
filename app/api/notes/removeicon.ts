import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function removeIcon({ documentId }: { documentId: string }) {
  const { userId } = await auth();
  // Find the document by its ID
  const existingDocument = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!existingDocument) {
    throw new Error('Document not found');
  }

  // Check if the document belongs to the authenticated user
  if (existingDocument.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // Update the document to remove the icon
  const updatedDocument = await prisma.document.update({
    where: { id: documentId },
    data: { icon: null }, // Remove the icon
  });

  return updatedDocument;
}
