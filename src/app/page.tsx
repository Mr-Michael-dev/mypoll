import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Share2, TrendingUp, Zap } from "lucide-react";

export default async function Home() {
  const { data: polls } = await supabase
    .from("polls")
    .select("id, question, poll_options(count), votes(count)")
    .order("created_at", { ascending: false })
    .limit(10);

  const formattedPolls = polls?.map((poll) => ({
    id: poll.id,
    question: poll.question,
    options_count: poll.poll_options[0]?.count || 0,
    votes_count: poll.votes[0]?.count || 0,
  }));

  return (
    <>
      <main>
        {/* Hero Section */}
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

        {/* Features Section */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex justify-center items-center h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Polling</h3>
                <p className="text-muted-foreground">
                  Create polls in seconds with a simple, intuitive interface.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex justify-center items-center h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto mb-4">
                  <Share2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
                <p className="text-muted-foreground">
                  Share your polls with a unique link on any social media
                  platform.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex justify-center items-center h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Results</h3>
                <p className="text-muted-foreground">
                  Watch the votes come in live and see the results instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Polls Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Recent Polls
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {formattedPolls && formattedPolls.length > 0 ? (
                formattedPolls.map((poll) => (
                  <div
                    key={poll.id}
                    className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                      {poll.question}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {poll.options_count} Options • {poll.votes_count} Votes
                    </p>
                    <div className="mt-auto">
                      <Link href={`/polls/${poll.id}`}>
                        <Button className="w-full">Vote</Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground sm:col-span-2 lg:col-span-3 py-12">
                  No polls have been created yet. Be the first!
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <h4 className="text-lg font-bold">Simple Polls</h4>
            <p className="text-sm text-gray-400">
              © 2024 Simple Polls. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-indigo-400 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-indigo-400 transition-colors">
              Contact
            </Link>
            <Link href="/terms" className="hover:text-indigo-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
