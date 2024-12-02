"use client";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ModeToggle } from "@/components/mode-toggle";
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
export function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const scrolled = useScrollTop();
  return (
    <div
      className={cn(
        `z-50 bg-background dark:bg-[#1F1F1F]  flex items-center w-full p-6`,
        scrolled && "border-b shadow-sm"
      )}
    >
      <Logo />
      <div className="md:ml-auto md:justify-end flex gap-x-2 justify-between items-center w-full">
        {!isLoaded && <Spinner />}
        {!isSignedIn && !isLoaded && (
          <>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button size="sm">Get Joshion free</Button>
            </SignInButton>
          </>
        )}
        {isSignedIn && isLoaded && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/documents">Enter NoteVerse</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </>
        )}
        <ModeToggle />
      </div>
    </div>
  );
}
