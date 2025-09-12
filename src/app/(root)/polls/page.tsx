"use client";

import { useEffect, useState } from "react";
import { EditPollForm } from "@/components/polls/EditPollForm";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from 'react-hot-toast';

interface Poll {
  id: string;
  question: string;
  created_at: string;
  created_by: string;
  options_count: number;
  votes_count: number;
  options?: string[];
}

// Actions component to handle buttons and dropdown for a single poll
function PollActions({ poll, user, openEditModal, handleDelete }: {
  poll: Poll;
  user: { id: string } | null;
  openEditModal: (poll: Poll) => void;
  handleDelete: (pollId: string) => Promise<void>;
}) {
  const isCreator = user && poll.created_by === user.id;

  return (
    <div className="flex justify-between items-center gap-2 mt-auto">
      <div className="flex gap-2 flex-grow">
        <Link href={`/polls/${poll.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            Vote
          </Button>
        </Link>
        {isCreator && (
          <Link href={`/polls/${poll.id}/results`} className="flex-1">
            <Button variant="secondary" className="w-full">
              Results
            </Button>
          </Link>
        )}
      </div>

      {isCreator && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditModal(poll)}>
              Edit Poll
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(poll.id)}>
              Delete Poll
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export default function PollsDashboard() {
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Handle error toasts from redirects
    const error = searchParams.get('error');
    if (error) {
      const errorMessage = {
        unauthorized_view_results: 'Only the poll creator can view the full results.',
        unauthorized_access: 'You must be logged in to view this page.',
        poll_not_found: 'The requested poll was not found.',
      }[error] || 'An unexpected error occurred.';
      
      toast.error(errorMessage, { duration: 5000});

      // Clean up the URL to prevent the toast from reappearing on refresh
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('error');
      router.replace(`?${newSearchParams.toString()}`);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?error=unauthorized_access");
      } else {
        const fetchPolls = async () => {
          setLoadingPolls(true);
          const { data, error } = await supabase
            .from("polls")
            .select("id, question, created_at, created_by, poll_options(count), votes(count)")
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Error fetching polls:", error);
            setPolls([]);
          } else {
            const formattedData = data.map((poll) => ({
              id: poll.id,
              question: poll.question,
              created_at: poll.created_at,
              created_by: poll.created_by,
              options_count: poll.poll_options[0]?.count || 0,
              votes_count: poll.votes[0]?.count || 0,
            }));
            setPolls(formattedData);
          }
          setLoadingPolls(false);
        };

        fetchPolls();
      }
    }
  }, [user, loading, router]);

  const openEditModal = async (poll: Poll) => {
    setLoadingPolls(true);
    const { data: options, error } = await supabase
      .from("poll_options")
      .select("text")
      .eq("poll_id", poll.id);

    if (error) {
      console.error("Error fetching options:", error);
    } else {
      const optionTexts = options.map((opt) => opt.text);
      setEditingPoll({ ...poll, options: optionTexts });
      setIsModalOpen(true);
    }
    setLoadingPolls(false);
  };

  const closeEditModal = () => {
    setEditingPoll(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (pollId: string) => {
    if (!confirm("Are you sure you want to delete this poll?")) {
      return;
    }
    const { error } = await supabase.from("polls").delete().eq("id", pollId);
    if (error) {

      toast.error(`Failed to delete poll: ${error.message}`, { duration: 5000});
    } else {
      setPolls((prev) => prev.filter((poll) => poll.id !== pollId));
      toast.success("The poll has been successfully deleted.", { duration: 5000});
    }
  };

  if (loading || loadingPolls) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-20 w-20 animate-spin text-primary" /> Loading ...
       </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Polls</h1>
        <Link href="/polls/create">
          <Button size="lg" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Loading..." : "Create Poll"}
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
                <p className="text-sm text-muted-foreground mb-4">
                  Created on: {new Date(poll.created_at).toLocaleDateString()}
                </p>
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Options: {poll.options_count}</p>
                  <p>Votes: {poll.votes_count}</p>
                </div>
                <PollActions
                  poll={poll}
                  user={user}
                  openEditModal={openEditModal}
                  handleDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && editingPoll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Poll</h2>
            <EditPollForm
              initialQuestion={editingPoll.question}
              initialOptions={editingPoll.options || ["", ""]}
              pollId={editingPoll.id}
            />
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
