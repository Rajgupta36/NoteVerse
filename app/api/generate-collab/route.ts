import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
    const { documentId } = await req.json();

    const collaborationLink = nanoid();
    await prisma.document.update({
        where: {
            id: documentId
        },
        data: {
            collaborationLink
        },
        select: {
            collaborationLink: true
        }
    })
    return NextResponse.json({ collaborationLink });
}

