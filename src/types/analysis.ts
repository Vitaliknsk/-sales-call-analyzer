export type ScriptComplianceItem = {
  /** Название этапа скрипта */
  stage: string;
  /** Этап выполнен */
  completed: boolean;
  /** Краткий комментарий эксперта */
  comment?: string;
};

/** Результат анализа звонка (ответ LLM + нормализация на сервере) */
export type SalesCallAnalysis = {
  overallScore: number;
  summary: string;
  scriptCompliance: ScriptComplianceItem[];
  mistakes: string[];
  recommendations: string[];
  strongMoments: string[];
  objectionHandling: string;
  closingAnalysis: string;
  transcript: string;
};
