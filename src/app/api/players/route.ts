import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { jsonDb } from "@/lib/jsonDb";
import { playerInputSchema, playerPatchSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await jsonDb.getPlayers());
}

export async function POST(request: Request) {
  const payload = playerInputSchema.parse(await request.json());
  const player = await jsonDb.savePlayer(payload);
  revalidatePath("/teams");
  revalidatePath(`/teams/${player.teamId}`);
  revalidatePath(`/players/${player.id}`);
  return NextResponse.json(player, { status: 201 });
}

export async function PATCH(request: Request) {
  const payload = playerPatchSchema.parse(await request.json());
  const player = await jsonDb.patchPlayer(payload);
  revalidatePath("/teams");
  revalidatePath(`/teams/${player.teamId}`);
  revalidatePath(`/players/${player.id}`);
  return NextResponse.json(player);
}
