"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  generatePublicSlug,
  hashPassword,
  normalizeEmail,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { ensureUserStickerRows } from "@/lib/album";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function registerAction(formData: FormData) {
  const name = getString(formData, "name");
  const email = normalizeEmail(getString(formData, "email"));
  const password = getString(formData, "password");

  if (!name || !email || password.length < 8) {
    redirect("/registro?error=Datos incompletos o contraseña menor a 8 caracteres");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/registro?error=Ya existe una cuenta con ese email");
  }

  let publicSlug = generatePublicSlug(name);
  while (await prisma.user.findUnique({ where: { publicSlug } })) {
    publicSlug = generatePublicSlug(name);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      publicSlug,
      passwordHash: await hashPassword(password),
    },
  });

  await ensureUserStickerRows(user.id);
  await createSession(user.id);
  redirect("/mi-album");
}

function safeNextPath(next: string) {
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(getString(formData, "email"));
  const password = getString(formData, "password");
  const next = getString(formData, "next");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    const errorRedirect = next
      ? `/login?error=${encodeURIComponent("Email o contraseña incorrectos")}&next=${encodeURIComponent(next)}`
      : "/login?error=Email o contraseña incorrectos";
    redirect(errorRedirect);
  }

  await createSession(user.id);
  redirect(safeNextPath(next) ?? "/mi-album");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function updateStickerQuantityAction(formData: FormData) {
  const user = await requireUser();
  const stickerId = getString(formData, "stickerId");
  const operation = getString(formData, "operation");

  const current = await prisma.userSticker.findUnique({
    where: { userId_stickerId: { userId: user.id, stickerId } },
  });

  const currentOwned = current?.ownedQuantity ?? 0;
  let ownedQuantity = currentOwned;

  if (operation === "increment") {
    ownedQuantity += 1;
  } else if (operation === "decrement") {
    ownedQuantity = Math.max(0, ownedQuantity - 1);
  } else if (operation === "missing") {
    ownedQuantity = 0;
  } else if (operation === "owned") {
    ownedQuantity = 1;
  } else if (operation === "repeated") {
    ownedQuantity = Math.max(2, ownedQuantity);
  }

  await prisma.userSticker.upsert({
    where: { userId_stickerId: { userId: user.id, stickerId } },
    create: {
      userId: user.id,
      stickerId,
      ownedQuantity,
      repeatedQuantity: Math.max(ownedQuantity - 1, 0),
    },
    update: {
      ownedQuantity,
      repeatedQuantity: Math.max(ownedQuantity - 1, 0),
    },
  });

  revalidatePath("/mi-album");
  revalidatePath("/grupos");
  revalidatePath(`/u/${user.publicSlug}/album`);
}

export async function addFriendAction(formData: FormData) {
  const user = await requireUser();
  const friendSlug = getString(formData, "friendSlug");
  const redirectTo = getString(formData, "redirectTo") || "/amigos";

  if (!friendSlug) {
    redirect(redirectTo);
  }

  const friend = await prisma.user.findUnique({
    where: { publicSlug: friendSlug },
    select: { id: true },
  });

  if (!friend || friend.id === user.id) {
    redirect(redirectTo);
  }

  await prisma.friend.upsert({
    where: { userId_friendUserId: { userId: user.id, friendUserId: friend.id } },
    create: { userId: user.id, friendUserId: friend.id },
    update: {},
  });

  revalidatePath("/amigos");
  revalidatePath(`/u/${friendSlug}/album`);
  redirect(redirectTo);
}

export async function removeFriendAction(formData: FormData) {
  const user = await requireUser();
  const friendSlug = getString(formData, "friendSlug");
  const redirectTo = getString(formData, "redirectTo") || "/amigos";

  if (!friendSlug) {
    redirect(redirectTo);
  }

  const friend = await prisma.user.findUnique({
    where: { publicSlug: friendSlug },
    select: { id: true },
  });

  if (friend) {
    await prisma.friend.deleteMany({
      where: { userId: user.id, friendUserId: friend.id },
    });
  }

  revalidatePath("/amigos");
  revalidatePath(`/u/${friendSlug}/album`);
  redirect(redirectTo);
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = getString(formData, "name");
  const publicSlug = getString(formData, "publicSlug")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!name || !publicSlug) {
    redirect("/configuracion?error=Completá nombre público y slug");
  }

  const existing = await prisma.user.findFirst({
    where: {
      publicSlug,
      NOT: { id: user.id },
    },
  });

  if (existing) {
    redirect("/configuracion?error=Ese link público ya está en uso");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name, publicSlug },
  });

  revalidatePath("/configuracion");
  redirect("/configuracion?ok=Perfil actualizado");
}

export async function resetAlbumAction() {
  const user = await requireUser();

  await prisma.userSticker.updateMany({
    where: { userId: user.id },
    data: {
      ownedQuantity: 0,
      repeatedQuantity: 0,
      notes: null,
    },
  });

  revalidatePath("/mi-album");
  redirect("/mi-album");
}
