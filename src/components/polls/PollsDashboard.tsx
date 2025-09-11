"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Poll {
  id: string;
  question: string;
  created_at: string;
}

export default function PollsDashboard() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchPolls = async () => {
        setLoadingPolls(true);
        const { data, error } = await supabase
          .from("polls")
          .select("id, question, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching polls:", error);
          setPolls([]);
        } else {
          setPolls(data);
        }
        setLoadingPolls(false);
      };

      fetchPolls();
    }
  }, [user]);

  if (loadingPolls) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading polls...</p>
      </div>
    );
  }
   return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Polls</h1>
        <Link href="/polls/create">
          <Button size="lg">
            Create Poll
          </Button>
        </Link>
      </div>

      <main>
        {polls.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">No polls yet!</h2>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first poll.
            </p>
            <Link href="/polls/create">
              <Button size="lg">Create Your First Poll</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
              >
                <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                  {poll.question}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Created on: {new Date(poll.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-3 mt-auto">
                  <Link href={`/polls/${poll.id}/results`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Results
                    </Button>
                  </Link>
                  <Link href={`/polls/${poll.id}`} className="flex-1">
                    <Button className="w-full">View</Button>
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
