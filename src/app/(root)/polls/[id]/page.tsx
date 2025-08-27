export default function PollPage({ params }: { params: { id: string } }) {
  return <div>Poll {params.id}</div>;
}