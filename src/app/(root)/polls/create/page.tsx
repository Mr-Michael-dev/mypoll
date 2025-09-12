"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { CreatePollForm } from "@/components/polls/CreatePollForm";
import { useAuth } from '@/context/AuthContext';

export default function CreatePollPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // toast.error("You must be logged in to create a poll.", { duration: 5000});

      router.replace('/login?error=unauthorized_access');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-20 w-20 animate-spin text-primary" /> Loading ....
    </div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Create Poll
        </h1>
        <p className="mt-2 text-muted-foreground">
          Set up your poll question and options
        </p>
      </div>
      <CreatePollForm />
    </div>
  );
}
