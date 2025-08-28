"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthButton() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return user ? (
    <div className="flex items-center gap-4">
      <p>Hello, {user.email}</p>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  ) : (
    <Link href="/login">
      <Button>Login</Button>
    </Link>
  );
}
