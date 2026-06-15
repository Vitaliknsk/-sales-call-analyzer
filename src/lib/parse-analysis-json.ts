import { analysisResponseSchema } from "@/lib/analysis-schema";
import type { SalesCallAnalysis } from "@/types/analysis";

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  if (fence) return fence[1].trim();
  return trimmed;
}

/** Извлекает первый JSON-объект из текста (на случай преамбулы модели) */
function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  if (start === -1) return text;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}

function cleanJsonString(rawJson: string): string {
  let cleaned = rawJson;
  
  // 1. Удаляем однострочные комментарии вида // ..., которые не являются частью URL
  // Ищем //, перед которым нет двоеточия (чтобы не задеть http:// или https://)
  cleaned = cleaned.replace(/(?<!:)\/\/.*$/gm, "");

  // 2. Исправляем многострочные строковые литералы в JSON.
  // Ищем переносы строк внутри кавычек и заменяем их на \n.
  // Это делается проходом по символам с отслеживанием открытых кавычек.
  let result = "";
  let inString = false;
  let escape = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '"' && !escape) {
      inString = !inString;
      result += char;
    } else if (char === '\\' && inString) {
      escape = !escape;
      result += char;
    } else {
      escape = false;
      if (inString && (char === '\n' || char === '\r')) {
        result += '\\n';
      } else {
        result += char;
      }
    }
  }

  return result;
}

export function parseAnalysisLlmJson(
  content: string,
  serverTranscript: string
): SalesCallAnalysis {
  const cleanedFences = stripCodeFences(content);
  const jsonSlice = extractJsonObject(cleanedFences);
  const sanitized = cleanJsonString(jsonSlice);
  
  let parsed: unknown;
  try {
    parsed = JSON.parse(sanitized);
  } catch (err) {
    console.error("Failed to parse JSON content from model. Original content:", content);
    console.error("Sanitized version:", sanitized);
    console.error("Parsing error:", err);
    throw new Error(`Модель вернула невалидный JSON: ${err instanceof Error ? err.message : "синтаксическая ошибка"}`);
  }
  const data = analysisResponseSchema.parse(parsed);
  return {
    overallScore: data.overallScore,
    summary: data.summary,
    scriptCompliance: data.scriptCompliance,
    mistakes: data.mistakes,
    recommendations: data.recommendations,
    strongMoments: data.strongMoments,
    objectionHandling: data.objectionHandling,
    closingAnalysis: data.closingAnalysis,
    transcript: data.transcript?.trim() ? data.transcript : serverTranscript,
  };
}
