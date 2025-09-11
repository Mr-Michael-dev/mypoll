"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Plus as PlusIcon } from "lucide-react"; // Changed to use lucide-react
import { useState } from "react";

function AuthContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    setIsSigningOut(false);
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/sign-up">
          <Button variant="default" size="lg" className="hidden sm:flex">
            Get Started
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="ghost" size="lg" className="hidden sm:flex">
            Login
          </Button>
          <Button variant="ghost" size="sm" className="sm:hidden">
            Login
          </Button>
        </Link>
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const userInitial = user.email ? user.email[0].toUpperCase() : "U";

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link href="/polls/create">
        <Button className="hidden sm:flex">Create Poll</Button>
        <Button
          size="sm"
          className="sm:hidden"
          variant="outline"
        >
          <span className="sr-only">Create Poll</span>
          <PlusIcon className="h-4 w-4" />
        </Button>
      </Link>
      <div className="flex items-center gap-2">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full ring-2 ring-primary/10"
          />
        ) : (
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {userInitial}
          </div>
        )}
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="hidden sm:flex"
          disabled={isSigningOut}
        >
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">MyPoll</span>
          </Link>
          <nav className="flex items-center gap-4">
            <AuthContent />
          </nav>
        </div>
      </div>
    </header>
  );
}
