export default function PollPage({ params }: { params: { id: string } }) {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">
          Poll Details
        </h1>
        <div className="text-muted-foreground">ID: {params.id}</div>
      </div>
    </div>
  );
}