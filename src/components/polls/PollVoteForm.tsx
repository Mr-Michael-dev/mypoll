"use client";

import { useState, useEffect } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { votePoll } from "@/lib/actions/pollActions";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface Option {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: Option[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Voting...
        </>
      ) : (
        "Vote"
      )}
    </Button>
  );
}

export default function PollVoteForm({ initialData, initialVotedStatus }: { initialData: Poll, initialVotedStatus: boolean }) {
  const [hasVoted, setHasVoted] = useState(initialVotedStatus);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [pollResults, setPollResults] = useState(initialData.options);
  
  const [state, formAction] = useFormState(votePoll, { message: "" });

  useEffect(() => {
    if (state.message) {
      if (state.message === "Vote submitted successfully!") {
        setHasVoted(true);
        toast.success(state.message);
        
        // Manually update the vote count for the selected option in the local state
        setPollResults(prevResults => {
          return prevResults.map(option => {
            if (option.id === selectedOptionId) {
              return { ...option, votes: option.votes + 1 };
            }
            return option;
          });
        });
        
      } else {
        toast.error(state.message);
      }
    }
  }, [state, selectedOptionId]);

  const totalVotes = pollResults.reduce((sum, option) => sum + option.votes, 0);

  const calculatePercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">
          {initialData.question}
        </h1>

        {!hasVoted ? (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="poll_id" value={initialData.id} />
            <RadioGroup name="poll_option_id" onValueChange={setSelectedOptionId}>
              {initialData.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="text-base">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <SubmitButton />
          </form>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-green-600">
                You have already voted in this poll.
              </h2>
              <p className="text-muted-foreground mt-2">
                Here are the current results.
              </p>
            </div>

            <div className="space-y-6">
              {pollResults.map((option) => (
                <div key={option.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-base font-medium">{option.text}</span>
                    <span className="text-sm text-muted-foreground">
                      {calculatePercentage(option.votes)}% ({option.votes})
                    </span>
                  </div>
                  <Progress value={calculatePercentage(option.votes)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
