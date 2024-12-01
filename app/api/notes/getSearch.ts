import { GetServerSidePropsContext } from "next";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const getSearch = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Not authenticated');
    }

    const documents = await prisma.document.findMany({
        where: {
            userId,
            isArchived: false,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return documents;
};

