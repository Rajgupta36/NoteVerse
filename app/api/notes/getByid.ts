import { GetServerSidePropsContext } from "next";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const getById = async ({
    id,
}: {
    id: string;
}) => {
    try {
        const { userId } = await auth();

        if (!userId) {
            throw new Error("Not authenticated");
        }

        const document = await prisma.document.findUnique({
            where: { id: id as string },
        });

        if (!document) {
            throw new Error("Not found");
        }

        if (document.isPublished && !document.isArchived) {
            return document;
        }



        return document;
    } catch (error) {
        console.error(error);
        throw new Error("Internal server error");
    }
};
