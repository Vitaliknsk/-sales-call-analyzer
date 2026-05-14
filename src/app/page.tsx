"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mic2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AudioUpload } from "@/components/audio-upload";
import { ScriptInput } from "@/components/script-input";
import { AnalysisLoading } from "@/components/analysis-loading";
import { AnalysisDashboard } from "@/components/analysis-dashboard";
import { AnalysisErrorBoundary } from "@/components/analysis-error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallAnalysis } from "@/hooks/use-call-analysis";

export default function HomePage() {
  const [audio, setAudio] = useState<File | null>(null);
  const [script, setScript] = useState("");
  const { loading, phase, result, run, reset } = useCallAnalysis();

  const canAnalyze = Boolean(audio && script.trim().length >= 20);

  return (
    <div className="mesh-gradient min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center sm:text-left"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
            <Mic2 className="h-3.5 w-3.5" />
            Контроль качества продаж на базе ИИ
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Анализ звонка менеджера по скрипту
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Загрузите запись разговора и скрипт продаж — система выполнит транскрибацию, оценит
            соблюдение этапов, сильные стороны и зоны роста, подготовит рекомендации и PDF-отчёт.
          </p>
        </motion.div>

        <AnalysisLoading active={loading} phase={phase} />

        {!result ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="glass-panel border-border/40">
              <CardHeader>
                <CardTitle>Аудиозапись звонка</CardTitle>
                <CardDescription>
                  Поддерживаются форматы MP3, WAV и M4A (до 25 МБ).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AudioUpload
                  file={audio}
                  onFileChange={setAudio}
                  disabled={loading}
                  onValidationError={(m) => toast.error(m)}
                />
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/40">
              <CardHeader>
                <CardTitle>Скрипт и критерии</CardTitle>
                <CardDescription>
                  Чем подробнее скрипт, тем точнее проверка этапов и формулировок.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScriptInput value={script} onChange={setScript} disabled={loading} />
              </CardContent>
            </Card>

            <div className="lg:col-span-2 flex flex-col items-center gap-3">
              <Button
                type="button"
                size="lg"
                className="min-w-[240px] shadow-lg shadow-primary/25"
                disabled={!canAnalyze || loading}
                onClick={() => {
                  if (audio) void run(audio, script);
                }}
              >
                Анализировать звонок
              </Button>
              {!canAnalyze ? (
                <p className="text-center text-xs text-muted-foreground">
                  Загрузите аудио и вставьте скрипт не короче 20 символов.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <AnalysisErrorBoundary
            onReset={() => {
              reset();
              setAudio(null);
              setScript("");
            }}
          >
            <AnalysisDashboard data={result} />
            <div className="mt-10 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                }}
              >
                Новый анализ
              </Button>
            </div>
          </AnalysisErrorBoundary>
        )}
      </main>
    </div>
  );
}
