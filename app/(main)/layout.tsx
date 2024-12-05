'use client';

import { Spinner } from '@/components/spinner';
import { redirect } from 'next/navigation';
import React from 'react';
import { Navigation } from './_components/Navigation';
import { SearchCommand } from '@/components/search-command';
import { useAuth } from '@clerk/nextjs';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="h-full flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isSignedIn) {
    return redirect('/');
  }

  return (
    <div className="h-full flex dark:bg-[#1F1F1F]">
      <Navigation />
      <main className="flex-1 h-full overflow-y-auto">
        <SearchCommand />
        {children}
      </main>
    </div>
  );
}
