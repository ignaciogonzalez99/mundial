import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { jsonDb } from "@/lib/jsonDb";
import { matchInputSchema, matchPatchSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await jsonDb.getMatches());
}

export async function POST(request: Request) {
  const payload = matchInputSchema.parse(await request.json());
  const match = await jsonDb.saveMatch(payload);
  revalidatePath("/matches");
  revalidatePath(`/matches/${match.id}`);
  return NextResponse.json(match, { status: 201 });
}

export async function PATCH(request: Request) {
  const payload = matchPatchSchema.parse(await request.json());
  const match = await jsonDb.patchMatch(payload);
  revalidatePath("/matches");
  revalidatePath(`/matches/${match.id}`);
  revalidatePath("/groups");
  return NextResponse.json(match);
}
