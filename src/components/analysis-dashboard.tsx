"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import type { SalesCallAnalysis } from "@/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreRing } from "@/components/score-ring";
import { ReportDownloadButton } from "@/components/report-download-button";
import { ScrollArea } from "@/components/ui/scroll-area";

function compliancePercent(analysis: SalesCallAnalysis): number {
  const items = analysis.scriptCompliance;
  if (!items.length) return 0;
  const done = items.filter((i) => i.completed).length;
  return Math.round((done / items.length) * 100);
}

export function AnalysisDashboard({ data }: { data: SalesCallAnalysis }) {
  const pct = useMemo(() => compliancePercent(data), [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Отчёт по звонку</h2>
          <p className="text-sm text-muted-foreground">
            ИИ-анализ на основе транскрипции и вашего скрипта
          </p>
        </div>
        <ReportDownloadButton analysis={data} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Сводка</TabsTrigger>
          <TabsTrigger value="transcript">Транскрипция</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Оценка</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pb-8 pt-2">
                <ScoreRing score={data.overallScore} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Резюме</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {data.summary}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle>Соблюдение скрипта</CardTitle>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                {pct}% соответствия
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.scriptCompliance.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Этапы скрипта не удалось разложить автоматически. Уточните скрипт и повторите анализ.
                </p>
              ) : (
                data.scriptCompliance.map((item, idx) => (
                  <motion.div
                    key={`${item.stage}-${idx}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex gap-3 rounded-xl border border-border/50 bg-muted/20 p-4"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    )}
                    <div>
                      <p className="font-medium">{item.stage}</p>
                      {item.comment ? (
                        <p className="mt-1 text-sm text-muted-foreground">{item.comment}</p>
                      ) : null}
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          <CollapsibleSection title="Ошибки менеджера" defaultOpen>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {data.mistakes.length ? (
                data.mistakes.map((m, i) => <li key={i}>{m}</li>)
              ) : (
                <li className="list-none pl-0 text-muted-foreground">
                  Критичных ошибок не выявлено.
                </li>
              )}
            </ul>
          </CollapsibleSection>

          <CollapsibleSection title="Рекомендации по улучшению" defaultOpen>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {data.recommendations.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </CollapsibleSection>

          <CollapsibleSection title="Сильные стороны звонка" defaultOpen>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {data.strongMoments.length ? (
                data.strongMoments.map((m, i) => <li key={i}>{m}</li>)
              ) : (
                <li className="list-none pl-0 text-muted-foreground">
                  Ярко выраженных сильных сторон не отмечено.
                </li>
              )}
            </ul>
          </CollapsibleSection>

          <CollapsibleSection title="Работа с возражениями" defaultOpen>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {data.objectionHandling}
            </p>
          </CollapsibleSection>

          <CollapsibleSection title="Анализ закрытия сделки" defaultOpen>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {data.closingAnalysis}
            </p>
          </CollapsibleSection>
        </TabsContent>

        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <CardTitle>Полная транскрипция разговора</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[min(70vh,520px)] rounded-xl border border-border/60 bg-muted/10 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {data.transcript}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
