import { NextRequest, NextResponse } from 'next/server';
import { create } from './create';
import { remove } from './remove';
import { getSearch } from './getSearch';
import { update } from './update';
import { getById } from './getByid';
import { getSidebar } from './getSidebar';
import { restore } from './restore';
import { archiveDocument } from './archieve';
import { getTrash } from './getTrash';
import { removeIcon } from './removeicon';
import { removeCoverImage } from './removecovericon';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'create') {
    const { title, parentDocument } = await request.json();
    const document = await create({ title, parentDocument });
    return NextResponse.json(document, { status: 201 });
  }

  if (action === 'update') {
    const { id, updatedContent } = await request.json();
    const document = await update({ id, updatedContent });
    return NextResponse.json(document);
  }
  if (action === 'restore') {
    const { id } = await request.json();
    console.log(id);
    const document = await restore({ id });
    return NextResponse.json(document);
  }
  if (action === 'archive') {
    const { documentId } = await request.json();
    const document = await archiveDocument({ documentId });
    return NextResponse.json(document);
  }
  if (action === 'removeIcon') {
    const { documentId } = await request.json();
    const document = await removeIcon({ documentId });
    return NextResponse.json(document);
  }
  if (action === 'removecoverimage') {
    const { documentId } = await request.json();
    const document = await removeCoverImage({ documentId });
    return NextResponse.json(document);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const documentId = searchParams.get('documentId');
  const parentId = searchParams.get('parentId');
  if (action === 'getAll') {
    const documents = await getSearch();
    return NextResponse.json(documents);
  }
  if (action === 'getById' && documentId) {
    const document = await getById({ id: documentId });
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(document);
  }
  if (action === 'getSideBar') {
    const documents = await getSidebar({ parentDocument: parentId || null });
    if (!documents) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(documents);
  }
  if (action === 'getTrash') {
    const documents = await getTrash();
    return NextResponse.json(documents);
  }
  return NextResponse.json(
    { error: 'Invalid action or missing documentId' },
    { status: 400 }
  );
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (documentId) {
    await remove({ id: documentId });
    return NextResponse.json({ message: 'Document removed successfully' });
  }

  return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
}
