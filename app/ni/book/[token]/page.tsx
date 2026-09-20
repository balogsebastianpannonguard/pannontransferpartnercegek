import BookPageClient from "./BookPageClient";

export default async function CompanyBookPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <BookPageClient token={token} />;
}
