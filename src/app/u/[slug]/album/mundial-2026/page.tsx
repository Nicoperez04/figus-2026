import { redirect } from "next/navigation";

export default async function LegacyPublicAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/u/${slug}/album`);
}
