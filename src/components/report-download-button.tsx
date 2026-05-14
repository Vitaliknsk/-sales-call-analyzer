"use client";

import { useCallback, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { FileDown, Loader2 } from "lucide-react";
import type { SalesCallAnalysis } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import { AnalysisPdfDocument } from "@/components/report-pdf-document";
import { toast } from "sonner";

type Props = {
  analysis: SalesCallAnalysis;
};

export function ReportDownloadButton({ analysis }: Props) {
  const [loading, setLoading] = useState(false);

  const download = useCallback(async () => {
    setLoading(true);
    try {
      const blob = await pdf(<AnalysisPdfDocument analysis={analysis} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `otchet-zvonok-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF-отчёт сохранён");
    } catch {
      toast.error("Не удалось сформировать PDF. Проверьте сеть и шрифты.");
    } finally {
      setLoading(false);
    }
  }, [analysis]);

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={loading}
      onClick={() => void download()}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      Скачать PDF отчет
    </Button>
  );
}
