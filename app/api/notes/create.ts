import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const create = async ({
  title,
  parentDocument,
}: {
  title: string;
  parentDocument: string;
}) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  const document = await prisma.document.create({
    data: {
      title,
      parentDocument: parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
    },
  });

  return document;
};
