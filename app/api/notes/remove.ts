import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const remove = async ({ id }: { id: string }) => {
  try {
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
    if (existingDocument.userId !== userId) {
      throw new Error('Unauthorized');
    }
    await prisma.document.delete({
      where: { id },
    });
    console.log('Document removed successfully');
    return;
  } catch (error) {
    console.error(error);
    throw new Error('Internal server error');
    return;
  }
};
