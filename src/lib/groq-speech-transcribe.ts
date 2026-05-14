import Groq from "groq-sdk";

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

/** Модель Groq Speech-to-Text (по умолчанию whisper-large-v3). */
export const GROQ_STT_MODEL_DEFAULT = "whisper-large-v3";

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
 * Транскрибация через Groq Speech-to-Text API (быстро, русский, mp3/wav/m4a).
 */
export async function transcribeWithGroqSpeechToText(params: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error(
      "Не задан GROQ_API_KEY для транскрибации (Groq Speech-to-Text)"
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
    process.env.GROQ_TRANSCRIPTION_MODEL?.trim() || GROQ_STT_MODEL_DEFAULT;

  const groq = new Groq({ apiKey });
  const blob = new Blob([new Uint8Array(params.buffer)], {
    type: effectiveMime,
  });
  const file = new File([blob], params.filename, { type: effectiveMime });

  const result = await groq.audio.transcriptions.create({
    file,
    model,
    language: "ru",
    response_format: "json",
    temperature: 0,
  });

  const text = result.text;
  if (!text?.trim()) {
    throw new Error("Транскрипция пуста — проверьте качество аудио");
  }
  return normalizeTranscriptText(text);
}
