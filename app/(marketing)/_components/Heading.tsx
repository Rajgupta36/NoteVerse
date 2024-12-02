"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";

export default function Heading() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        Your Ideas, Documents, & Plans. Unified. Welcome to{" "}
        <span className="underline">NoteVerse</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        NoteVerse is the connected workspace where <br />
        better, faster work happens
      </h3>
      {!isLoaded && (
        <div className="w-full flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      )}
      {isSignedIn && isLoaded && (
        <Button asChild>
          <Link href="/documents">
            Enter NoteVerse
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      )}
      {!isSignedIn && !isLoaded && (
        <SignInButton mode="modal">
          <Button>
            Get NoteVerse Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
}
