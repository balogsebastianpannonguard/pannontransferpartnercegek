import TrackPageClient from "./TrackPageClient";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <TrackPageClient token={token} />;
}
