import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { jsonDb } from "@/lib/jsonDb";
import { resultInputSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function revalidateCore(matchId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/groups");
  revalidatePath("/matches");
  revalidatePath("/predictions");
  revalidatePath("/admin");
  if (matchId) revalidatePath(`/matches/${matchId}`);
}

export async function GET() {
  return NextResponse.json(await jsonDb.getResults());
}

export async function POST(request: Request) {
  try {
    const payload = resultInputSchema.parse(await request.json());
    const result = await jsonDb.saveResult(payload);
    revalidateCore(result.matchId);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
