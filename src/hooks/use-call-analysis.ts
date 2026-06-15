"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { SalesCallAnalysis } from "@/types/analysis";
import { upload } from "@vercel/blob/client";

export type LoadingPhase = 0 | 1 | 2 | 3;

export function useCallAnalysis() {
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<LoadingPhase>(0);
  const [result, setResult] = useState<SalesCallAnalysis | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setPhase(0);
    setLoading(false);
  }, []);

  const run = useCallback(async (file: File, script: string) => {
    setLoading(true);
    setResult(null);
    setPhase(0);
    try {
      setPhase(0);
      
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      setPhase(1);
      const tr = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blobUrl: newBlob.url,
          filename: file.name,
          mimeType: file.type,
        }),
      });
      const trJson = (await tr.json()) as { transcript?: string; error?: string };
      if (!tr.ok) {
        throw new Error(trJson.error ?? "Ошибка транскрибации");
      }
      const transcript = trJson.transcript?.trim();
      if (!transcript) {
        throw new Error("Пустая транскрипция");
      }

      setPhase(2);
      const an = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, script }),
      });
      const anJson = (await an.json()) as {
        analysis?: SalesCallAnalysis;
        error?: string;
      };
      if (!an.ok) {
        throw new Error(anJson.error ?? "Ошибка анализа");
      }
      if (!anJson.analysis) {
        throw new Error("Пустой ответ анализа");
      }

      setPhase(3);
      await new Promise((r) => setTimeout(r, 500));

      setResult(anJson.analysis);
      toast.success("Анализ завершён");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
      toast.error(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, phase, result, run, reset };
}
