import { CreatePollForm } from "@/components/polls/CreatePollForm";

export default function CreatePollPage() {
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