import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
export async function archiveDocument({ documentId }: { documentId: string }) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error('Not authenticated');
    }
    try {
        const existingDocument = await prisma.document.findUnique({
            where: { id: documentId },
        });

        if (!existingDocument) {
            throw new Error('Document not found');
        }

        if (existingDocument.userId !== userId) {
            throw new Error('Unauthorized');
        }

        const recursiveArchive = async (documentId: string) => {
            const children = await prisma.document.findMany({
                where: { parentDocument: documentId, userId },
            });

            for (const child of children) {
                await prisma.document.update({
                    where: { id: child.id },
                    data: { isArchived: true },
                });
                await recursiveArchive(child.id);
            }
        };

        await prisma.document.update({
            where: { id: documentId },
            data: { isArchived: true },
        });

        await recursiveArchive(documentId);

        return { message: 'Document archived successfully' };
    } catch (error) {
        console.error(error);
        throw new Error(error.message || 'Internal server error');
    }
}
