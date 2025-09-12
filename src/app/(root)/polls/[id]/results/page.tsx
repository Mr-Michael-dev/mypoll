import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PollResults {
  id: string;
  question: string;
  created_at: string;
  created_by: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
}

// Function to fetch poll data and votes from the database
async function getPollResults(pollId: string): Promise<PollResults | null> {
  const supabase = createServerComponentClient({ cookies });

  const { data: poll, error } = await supabase
    .from("polls")
    .select("id, question, created_at, created_by, poll_options(id, text)")
    .eq("id", pollId)
    .single();

  if (error || !poll) {
    console.error("Error fetching poll details:", error);
    return null;
  }

  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("poll_option_id")
    .eq("poll_id", pollId);

  if (votesError) {
    console.error("Error fetching votes:", votesError);
    return null;
  }

  const aggregatedVotes = poll.poll_options.map((option) => ({
    ...option,
    votes: votes.filter((vote) => vote.poll_option_id === option.id).length,
  }));

  return {
    ...poll,
    options: aggregatedVotes,
  };
}

export default async function PollResultsPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  const pollResults = await getPollResults(params.id);

  if (!user) {
    redirect(`/login?error=unauthorized_access`);
  }

  if (!pollResults) {
    redirect(`/polls?error=poll_not_found`);
  }

  if (pollResults.created_by !== user.id) {
    redirect(`/polls?error=unauthorized_view_results`);
  }

  const totalVotes = pollResults.options.reduce((sum, opt) => sum + opt.votes, 0);

  // Sort options by vote count in descending order
  const sortedOptions = [...pollResults.options].sort((a, b) => b.votes - a.votes);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="mb-2 sm:mb-0">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                {pollResults.question}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Results for your poll.
              </CardDescription>
            </div>
            <Link href={`/polls/${pollResults.id}`} passHref>
              <Button variant="outline">View Poll</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pt-4">
            <div className="flex flex-col">
              <span className="font-semibold">Total Votes</span>
              <span className="text-xl font-bold text-primary">{totalVotes}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Created On</span>
              <span className="text-xl font-bold text-primary">
                {new Date(pollResults.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="my-6" />
          <h2 className="text-xl font-semibold mb-4">Vote Breakdown</h2>
          <div className="space-y-6">
            {sortedOptions.map((option) => {
              const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
              const isLeading = sortedOptions[0].id === option.id && totalVotes > 0;

              return (
                <div key={option.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-base font-medium ${isLeading ? 'text-primary' : ''}`}>
                      {option.text}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {percentage}% ({option.votes})
                    </span>
                  </div>
                  <Progress value={percentage} className={isLeading ? 'bg-primary' : 'bg-secondary'} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
