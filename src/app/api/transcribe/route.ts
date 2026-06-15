import { NextResponse } from "next/server";
import { transcribeWithGroqSpeechToText } from "@/lib/groq-speech-transcribe";
import { del } from "@vercel/blob";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { blobUrl, filename, mimeType } = json;

    if (!blobUrl || !filename) {
      return NextResponse.json(
        { error: "Ожидается blobUrl и filename" },
        { status: 400 }
      );
    }

    const lower = filename.toLowerCase();
    if (!lower.endsWith(".mp3") && !lower.endsWith(".wav") && !lower.endsWith(".m4a")) {
      return NextResponse.json(
        { error: "Допустимые расширения: .mp3, .wav, .m4a" },
        { status: 400 }
      );
    }

    // Скачиваем аудио из Vercel Blob
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Не удалось скачать файл из хранилища: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    const maxBytes = 30 * 1024 * 1024;
    if (buf.length > maxBytes) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимум 30 МБ." },
        { status: 413 }
      );
    }

    const transcript = await transcribeWithGroqSpeechToText({
      buffer: buf,
      filename: filename,
      mimeType: mimeType || "application/octet-stream",
    });

    // Удаляем файл из Blob, чтобы не занимал место
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        await del(blobUrl);
      }
    } catch (err) {
      console.error("Не удалось удалить blob", err);
    }

    return NextResponse.json({ transcript });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Внутренняя ошибка сервера";
    const status = message.includes("GROQ_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
