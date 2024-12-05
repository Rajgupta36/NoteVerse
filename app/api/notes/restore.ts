import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function restore({ id }: { id: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthenticated');
    return;
  }

  try {
    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      throw new Error('Not found');
      return;
    }

    if (existingDocument.userId !== userId) {
      throw new Error('Unauthorized');
      return;
    }

    const recursiveRestore = async (documentId: string) => {
      const children = await prisma.document.findMany({
        where: {
          parentDocument: documentId,
          userId,
        },
      });

      for (const child of children) {
        await prisma.document.update({
          where: { id: child.id },
          data: { isArchived: false },
        });

        await recursiveRestore(child.id);
      }
    };

    const updateData: any = {
      isArchived: false,
    };

    if (existingDocument.parentDocument) {
      const parent = await prisma.document.findUnique({
        where: { id: existingDocument.parentDocument },
      });

      if (parent?.isArchived) {
        updateData.parentDocumentId = null;
      }
    }
    const document = await prisma.document.update({
      where: { id },
      data: updateData,
    });

    await recursiveRestore(id);
    return document;
  } catch (error) {
    console.error('Error restoring document:', error);
    return;
  }
}
