import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { jsonDb } from "@/lib/jsonDb";
import { predictionSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const predictions = await jsonDb.getPredictions();
  if (predictions.length > 0) {
    return NextResponse.json(predictions);
  }

  return NextResponse.json(await jsonDb.regeneratePredictions());
}

export async function POST(request: Request) {
  const text = await request.text();
  if (text.trim()) {
    const payload = predictionSchema.parse(JSON.parse(text));
    const prediction = await jsonDb.savePrediction(payload);
    revalidatePath("/predictions");
    revalidatePath(`/matches/${prediction.matchId}`);
    return NextResponse.json(prediction, { status: 201 });
  }

  const predictions = await jsonDb.regeneratePredictions();
  revalidatePath("/dashboard");
  revalidatePath("/matches");
  revalidatePath("/predictions");
  return NextResponse.json(predictions, { status: 201 });
}
