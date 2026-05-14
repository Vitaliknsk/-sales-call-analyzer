import { NextResponse } from "next/server";
import { transcribeWithGroqSpeechToText } from "@/lib/groq-speech-transcribe";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Ожидается multipart/form-data с полем file" },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const entry = form.get("file");
    if (!entry || !(entry instanceof File)) {
      return NextResponse.json(
        { error: "Файл не найден. Используйте поле file." },
        { status: 400 }
      );
    }

    const file = entry;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".mp3") && !lower.endsWith(".wav") && !lower.endsWith(".m4a")) {
      return NextResponse.json(
        { error: "Допустимые расширения: .mp3, .wav, .m4a" },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const maxBytes = 25 * 1024 * 1024;
    if (buf.length > maxBytes) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимум 25 МБ для MVP." },
        { status: 413 }
      );
    }

    const transcript = await transcribeWithGroqSpeechToText({
      buffer: buf,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
    });

    return NextResponse.json({ transcript });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Внутренняя ошибка сервера";
    const status = message.includes("GROQ_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
