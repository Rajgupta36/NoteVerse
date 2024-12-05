import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const { collaborationLink, userId, isGuest, guestId } = await req.json();

  const document = await prisma.document.findFirst({
    where: { collaborationLink },
  });

  if (!document) {
    return NextResponse.json(
      { error: 'Invalid collaboration link' },
      { status: 400 }
    );
  }

  await prisma.document.update({
    where: { id: document.id },
    data: {
      guestCollaborationId: {
        push: isGuest ? `guest:${guestId}` : userId,
      },
    },
  });

  //websockets  logic

  return NextResponse.json({ success: true });
}
