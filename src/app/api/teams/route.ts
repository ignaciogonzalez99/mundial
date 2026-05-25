import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { jsonDb } from "@/lib/jsonDb";
import { teamInputSchema, teamPatchSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await jsonDb.getTeams());
}

export async function POST(request: Request) {
  const payload = teamInputSchema.parse(await request.json());
  const team = await jsonDb.saveTeam(payload);
  revalidatePath("/teams");
  revalidatePath("/dashboard");
  return NextResponse.json(team, { status: 201 });
}

export async function PATCH(request: Request) {
  const payload = teamPatchSchema.parse(await request.json());
  const team = await jsonDb.patchTeam(payload);
  revalidatePath("/teams");
  revalidatePath(`/teams/${team.id}`);
  revalidatePath("/dashboard");
  return NextResponse.json(team);
}
