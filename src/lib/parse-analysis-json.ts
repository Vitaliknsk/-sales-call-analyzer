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

export function parseAnalysisLlmJson(
  content: string,
  serverTranscript: string
): SalesCallAnalysis {
  const cleaned = stripCodeFences(content);
  const jsonSlice = extractJsonObject(cleaned);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    throw new Error("Модель вернула невалидный JSON");
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
