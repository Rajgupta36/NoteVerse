import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const update = async ({
    id,
    updatedContent
}: {
    id: string;
    updatedContent: any
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


    // Update the document
    const updatedDocument = await prisma.document.update({
        where: { id },
        data: {
            ...updatedContent
        },
    });

    return updatedDocument;
};
