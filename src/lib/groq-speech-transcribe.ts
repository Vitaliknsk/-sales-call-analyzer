import { createClient } from "@deepgram/sdk";

const ALLOWED_AUDIO = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/x-m4a",
  "audio/m4a",
  "audio/mp4",
]);

/** Модель Deepgram STT (по умолчанию nova-3). */
export const GROQ_STT_MODEL_DEFAULT = "nova-3";

function normalizeMime(type: string): string {
  const t = type.split(";")[0]?.trim().toLowerCase() ?? "";
  if (t === "audio/mp3") return "audio/mpeg";
  return t;
}

export function inferMimeFromFilename(filename: string): string | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".m4a")) return "audio/m4a";
  return null;
}

export function assertAudioMime(mime: string): void {
  const n = normalizeMime(mime);
  if (n === "application/octet-stream" || n === "") return;
  if (!ALLOWED_AUDIO.has(n)) {
    throw new Error(
      "Неподдерживаемый формат аудио. Разрешены: MP3, WAV, M4A."
    );
  }
}

/** Нормализует пробелы и переносы для «чистого» текста транскрипта. */
export function normalizeTranscriptText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Транскрибация через Deepgram Speech-to-Text API (быстро, русский, mp3/wav/m4a).
 */
export async function transcribeWithGroqSpeechToText(params: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error(
      "Не задан DEEPGRAM_API_KEY для транскрибации (Deepgram Speech-to-Text)"
    );
  }

  const inferred = inferMimeFromFilename(params.filename);
  const normalized = normalizeMime(params.mimeType);
  const effectiveMime =
    inferred ??
    (normalized && normalized !== "application/octet-stream"
      ? normalized
      : "audio/mpeg");

  assertAudioMime(effectiveMime);

  const model =
    process.env.DEEPGRAM_MODEL?.trim() || GROQ_STT_MODEL_DEFAULT;

  const deepgram = createClient(apiKey);

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    params.buffer,
    {
      model,
      language: "ru",
      smart_format: true,
      punctuate: true,
    }
  );

  if (error) {
    throw new Error(`Deepgram ошибка: ${error.message}`);
  }

  const text =
    result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

  if (!text?.trim()) {
    throw new Error("Транскрипция пуста — проверьте качество аудио");
  }

  return normalizeTranscriptText(text);
}
