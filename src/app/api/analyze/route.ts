import { NextResponse } from "next/server";
import { z } from "zod";
import { runSalesLlmAnalysis } from "@/lib/llm-analyze";

export const runtime = "nodejs";
export const maxDuration = 300;

const bodySchema = z.object({
  transcript: z.string().min(20, "Транскрипция слишком короткая"),
  script: z.string().min(20, "Скрипт слишком короткий"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Укажите корректные поля transcript и script (не короче 20 символов)." },
        { status: 400 }
      );
    }

    const { transcript, script } = parsed.data;
    const analysis = await runSalesLlmAnalysis(transcript, script);
    return NextResponse.json({ analysis });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Внутренняя ошибка сервера";
    const status =
      message.includes("GROQ_API_KEY") ||
      message.includes("OPENROUTER_API_KEY")
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
