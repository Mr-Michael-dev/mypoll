// /app/polls/[id]/page.tsx
// This is a Server Component that fetches data

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import PollVoteForm from "@/components/polls/PollVoteForm";

// Define the data types for better type safety
interface Poll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
}

// Function to fetch all necessary data for the poll page
async function getPollData(pollId: string): Promise<Poll | null> {
  const supabase = createServerComponentClient({ cookies });

  // Fetch the poll question and options
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("id, question, poll_options(id, text)")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    console.error("Error fetching poll:", pollError);
    return null;
  }

  // Fetch votes for each option
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("poll_option_id")
    .eq("poll_id", pollId);

  if (votesError) {
    console.error("Error fetching votes:", votesError);
    return null;
  }

  // Aggregate votes for each option
  const aggregatedVotes = poll.poll_options.map((option) => ({
    ...option,
    votes: votes.filter((v) => v.poll_option_id === option.id).length,
  }));

  return {
    id: poll.id,
    question: poll.question,
    options: aggregatedVotes,
  };
}

export default async function PollPage({ params }: { params: { id: string } }) {
  const cookiesStore = await cookies();
  const pollData = await getPollData(params.id);
  const hasVoted = await cookiesStore.get(`voted-poll-${params.id}`);

  if (!pollData) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500">Poll Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The poll with ID: {params.id} does not exist.
          </p>
        </div>
      </div>
    );
  }

  // Pass the server-fetched data and cookie status to the client component
  return <PollVoteForm initialData={pollData} initialVotedStatus={!!hasVoted} />;
}
