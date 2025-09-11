import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { data: polls } = await supabase
    .from("polls")
    .select("id, question")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6">
            Create and Share Polls{" "}
            <span className="text-indigo-600">in Seconds</span>
          </h1>
          <p className="max-w-[700px] mx-auto mb-8 text-lg sm:text-xl text-muted-foreground">
            The easiest way to create, share, and vote on polls. Get real-time
            results and engage your audience.
          </p>
          <Link href="/polls/create">
            <Button size="lg" className="px-8 py-6 text-lg">
              Create a Poll
            </Button>
          </Link>
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Recent Polls</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {polls?.map((poll) => (
              <Link href={`/polls/${poll.id}`} key={poll.id} className="block">
                <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <h3 className="text-lg font-semibold line-clamp-2">
                    {poll.question}
                  </h3>
                </div>
              </Link>
            ))}
            {polls?.length === 0 && (
              <p className="text-center text-muted-foreground sm:col-span-2 lg:col-span-3 py-12">
                No polls have been created yet. Be the first!
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
