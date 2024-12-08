import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const update = async ({
  id,
  updatedContent,
}: {
  id: string;
  updatedContent: any;
}) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const existingDocument = await prisma.document.findUnique({
    where: { id },
  });

  if (!existingDocument) {
    throw new Error('Document not found');
  }

  // Check if the authenticated user is the owner of the document
  if (existingDocument.userId !== userId) {
    throw new Error('You are not authorized to update this document');
  }
  // Update the document
  console.log("data", updatedContent);
  const updatedDocument = await prisma.document.update({
    where: { id },
    data: {
      ...updatedContent,
    },
  });

  return updatedDocument;
};
