import { supabase } from "@/lib/supabase";
import Link from "next/link";
import AuthButton from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { data: polls } = await supabase
    .from("polls")
    .select("id, question")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container z-40 bg-background">
        <div className="flex items-center justify-between h-20 py-6">
          <Link href="/" className="text-2xl font-bold">
            MyPoll
          </Link>
          <AuthButton />
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 text-center">
          <div className="container">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Create and Share Polls in Seconds
            </h1>
            <p className="max-w-[700px] mx-auto my-4 text-lg text-muted-foreground">
              The easiest way to create, share, and vote on polls. Get real-time
              results and engage your audience.
            </p>
            <Link href="/polls/create">
              <Button size="lg">Create a Poll</Button>
            </Link>
          </div>
        </section>
        <section className="py-12 bg-gray-50">
          <div className="container">
            <h2 className="mb-8 text-3xl font-bold text-center">
              Recent Polls
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {polls?.map((poll) => (
                <Link href={`/polls/${poll.id}`} key={poll.id}>
                  <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold">{poll.question}</h3>
                  </div>
                </Link>
              ))}
              {polls?.length === 0 && (
                <p className="text-center text-muted-foreground md:col-span-3">
                  No polls have been created yet. Be the first!
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>Built with Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
