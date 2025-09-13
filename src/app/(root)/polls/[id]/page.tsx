// /app/polls/[id]/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import PollVoteForm from "@/components/polls/PollVoteForm";

interface Poll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
}

async function getPollData(pollId: string): Promise<Poll | null> {
  const supabase = createServerComponentClient({ cookies });

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("id, question, poll_options(id, text)")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) return null;

  const { data: votes } = await supabase
    .from("votes")
    .select("poll_option_id")
    .eq("poll_id", pollId);

  const aggregatedVotes = poll.poll_options.map((option) => ({
    ...option,
    votes: votes?.filter((v) => v.poll_option_id === option.id).length ?? 0,
  }));

  return {
    id: poll.id,
    question: poll.question,
    options: aggregatedVotes,
  };
}

export default async function PollPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const cookiesStore = await cookies()
  const { data: { user } } = await supabase.auth.getUser();

  const pollData = await getPollData(params.id);

  // Default: not voted
  let hasVoted = false;
  if (pollData) {
    if (user) {
      // logged in → check DB by user_id
      const { data: existingVote } = await supabase
        .from("votes")
        .select("id")
        .eq("poll_id", params.id)
        .eq("user_id", user.id)
        .maybeSingle();

      hasVoted = !!existingVote;
    } else {
      // anonymous → check DB by voter_id cookie
      const voterId = cookiesStore.get("voter_id")?.value;
      if (voterId) {
        const { data: existingVote } = await supabase
          .from("votes")
          .select("id")
          .eq("poll_id", params.id)
          .eq("voter_id", voterId)
          .maybeSingle();

        hasVoted = !!existingVote;
      }
    }
  }


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

  return (
    <PollVoteForm
      initialData={pollData}
      initialVotedStatus={hasVoted}
    />
  );
}
