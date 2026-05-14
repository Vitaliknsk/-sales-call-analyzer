"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const STEPS = [
  "Загрузка аудио...",
  "Транскрибация разговора...",
  "Анализ качества продаж...",
  "Формирование рекомендаций...",
] as const;

type Phase = 0 | 1 | 2 | 3;

type Props = {
  active: boolean;
  phase: Phase;
};

export function AnalysisLoading({ active, phase }: Props) {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (!active) {
      setProgress(8);
      return;
    }
    const targets: Record<Phase, number> = {
      0: 22,
      1: 48,
      2: 78,
      3: 94,
    };
    const t = targets[phase];
    const id = setInterval(() => {
      setProgress((p) => (p < t ? Math.min(t, p + 3) : p));
    }, 120);
    return () => clearInterval(id);
  }, [active, phase]);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <motion.div
          initial={{ scale: 0.96, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          className="glass-panel mx-4 w-full max-w-md p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">Идёт анализ звонка</p>
              <p className="text-sm text-muted-foreground">
                Пожалуйста, не закрывайте страницу
              </p>
            </div>
          </div>

          <ul className="mb-6 space-y-3">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                {i < phase ? (
                  <span className="text-primary">✓</span>
                ) : i === phase ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <span className="text-muted-foreground">○</span>
                )}
                <span
                  className={
                    i === phase
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <Progress value={progress} className="h-2" />

          <div className="mt-6 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
