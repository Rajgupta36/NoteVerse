import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";



export const getSidebar = async ({ parentDocument }: { parentDocument: string | null }) => {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
        return;
    }

    const userId = session.userId;
    parentDocument = parentDocument === "undefined" ? null : parentDocument;
    try {
        const documents = await prisma.document.findMany({
            where: {
                userId: userId as string,
                parentDocument: parentDocument,
                isArchived: false,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return documents;
    } catch (error) {
        console.error("Error fetching documents:", error);
        return;
    }
};


