import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { jsonDb } from "@/lib/jsonDb";
import { runManualSync } from "@/lib/syncSources";
import { syncInputSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = syncInputSchema.parse(await request.json());
  const entry = await runManualSync(payload);
  await jsonDb.appendSyncLog(entry);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return NextResponse.json(entry, { status: 201 });
}
