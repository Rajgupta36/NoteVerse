import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
export async function removeCoverImage({ documentId }: { documentId: string }) {
    // Find the document by its ID
    const { userId } = await auth();
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

    // Update the document to remove the cover image
    const updatedDocument = await prisma.document.update({
        where: { id: documentId },
        data: { coverImage: null }, // Remove the cover image
    });

    return updatedDocument;
}