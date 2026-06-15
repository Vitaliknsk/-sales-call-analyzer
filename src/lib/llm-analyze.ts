import Groq from "groq-sdk";
import {
  buildSalesAnalysisSystemPrompt,
  buildSalesAnalysisUserContent,
} from "@/lib/prompts";
import { parseAnalysisLlmJson } from "@/lib/parse-analysis-json";
import type { SalesCallAnalysis } from "@/types/analysis";

const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";

async function callGroq(
  transcript: string,
  script: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Не задан GROQ_API_KEY");

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.25,
    max_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSalesAnalysisSystemPrompt() },
      {
        role: "user",
        content: buildSalesAnalysisUserContent(transcript, script),
      },
    ],
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Пустой ответ модели Groq");
  return content;
}

async function callOpenRouter(
  transcript: string,
  script: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Не задан OPENROUTER_API_KEY");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Sales Call Analyzer MVP",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.25,
      max_tokens: 8192,
      messages: [
        { role: "system", content: buildSalesAnalysisSystemPrompt() },
        {
          role: "user",
          content: buildSalesAnalysisUserContent(transcript, script),
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter: ${res.status} ${res.statusText}${errText ? ` — ${errText.slice(0, 500)}` : ""}`
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Пустой ответ модели OpenRouter");
  return content;
}

/**
 * Выбирает провайдера: приоритет OpenRouter (из-за лимитов Groq), иначе Groq.
 */
export async function runSalesLlmAnalysis(
  transcript: string,
  script: string
): Promise<SalesCallAnalysis> {
  const useGroq = Boolean(process.env.GROQ_API_KEY?.trim());
  const useOpenRouter = Boolean(process.env.OPENROUTER_API_KEY?.trim());

  if (!useGroq && !useOpenRouter) {
    throw new Error(
      "Укажите GROQ_API_KEY или OPENROUTER_API_KEY в переменных окружения"
    );
  }

  const raw = useOpenRouter
    ? await callOpenRouter(transcript, script)
    : await callGroq(transcript, script);

  return parseAnalysisLlmJson(raw, transcript);
}
