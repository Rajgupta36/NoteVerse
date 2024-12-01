import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const getTrash = async () => {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Not authenticated");
    }
    const documents = await prisma.document.findMany({
        where: {
            userId: userId,
            isArchived: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return documents;
};
