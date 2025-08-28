"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthButton from "@/components/auth/AuthButton";

interface Poll {
  id: string;
  question: string;
  created_at: string;
}

export default function PollsDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchPolls = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("polls")
        .select("id, question, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching polls:", error);
        // For the purpose of this example, we'll assume the table exists.
        // If the table 'polls' does not exist, this will error.
        // We will proceed with an empty array of polls.
        setPolls([]);
      } else {
        setPolls(data);
      }
      setLoading(false);
    };

    fetchPolls();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Polls</h1>
        <div className="flex items-center gap-4">
          <AuthButton />
          <Link href="/polls/create">
            <Button>Create New Poll</Button>
          </Link>
        </div>
      </header>
      <main>
        {polls.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No polls yet!</h2>
            <p className="text-gray-500 mt-2">
              Get started by creating your first poll.
            </p>
            <Link href="/polls/create" className="mt-4 inline-block">
              <Button>Create Poll</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2 truncate">
                  {poll.question}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Created on: {new Date(poll.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2 justify-end">
                  <Link href={`/polls/${poll.id}/results`}>
                    <Button variant="outline">Results</Button>
                  </Link>
                  <Link href={`/polls/${poll.id}`}>
                    <Button>View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
