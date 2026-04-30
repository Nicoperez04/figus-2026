import "server-only";

import { calculateProgress, getAlbumForUser } from "@/lib/album";
import { prisma } from "@/lib/prisma";

export type FriendSummary = {
  friendshipId: string;
  user: { id: string; name: string; publicSlug: string };
  progress: ReturnType<typeof calculateProgress>;
  repeatedCount: number;
};

export async function getFriendsForUser(userId: string): Promise<FriendSummary[]> {
  const rows = await prisma.friend.findMany({
    where: { userId },
    include: {
      friend: {
        select: { id: true, name: true, publicSlug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (rows.length === 0) return [];

  const summaries = await Promise.all(
    rows.map(async (row) => {
      const album = await getAlbumForUser(row.friend.id);
      const repeatedCount = album.stickers.reduce((sum, sticker) => sum + sticker.repeatedQuantity, 0);
      return {
        friendshipId: row.id,
        user: row.friend,
        progress: album.progress,
        repeatedCount,
      } satisfies FriendSummary;
    }),
  );

  return summaries;
}

export async function isFriend(userId: string, friendUserId: string) {
  const row = await prisma.friend.findUnique({
    where: { userId_friendUserId: { userId, friendUserId } },
    select: { id: true },
  });
  return Boolean(row);
}
