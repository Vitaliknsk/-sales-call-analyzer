import { z } from "zod";

const scriptComplianceItemSchema = z.object({
  stage: z.string(),
  completed: z.boolean(),
  comment: z.string().optional(),
});

/** Допускаем строки или объекты — нормализуем к ScriptComplianceItem */
const scriptComplianceFlexible = z.array(
  z.union([
    z.string().transform((s) => ({
      stage: s,
      completed: false,
      comment: undefined as string | undefined,
    })),
    scriptComplianceItemSchema,
    z
      .object({
        этап: z.string().optional(),
        выполнено: z.boolean().optional(),
        комментарий: z.string().optional(),
      })
      .transform((o) => ({
        stage: o.этап ?? "Этап",
        completed: o.выполнено ?? false,
        comment: o.комментарий,
      })),
  ])
);

export const analysisResponseSchema = z.object({
  overallScore: z.coerce.number().min(0).max(10),
  summary: z.string().default(""),
  scriptCompliance: scriptComplianceFlexible.optional().default([]),
  mistakes: z.array(z.string()).optional().default([]),
  recommendations: z.array(z.string()).optional().default([]),
  strongMoments: z.array(z.string()).optional().default([]),
  objectionHandling: z.string().default(""),
  closingAnalysis: z.string().default(""),
  transcript: z.string().optional(),
});

export type ParsedAnalysis = z.infer<typeof analysisResponseSchema>;
