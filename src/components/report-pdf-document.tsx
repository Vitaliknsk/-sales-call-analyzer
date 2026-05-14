"use client";

import { Document, Page, Text, StyleSheet, Font } from "@react-pdf/renderer";
import type { SalesCallAnalysis } from "@/types/analysis";

try {
  Font.register({
    family: "NotoSans",
    fonts: [
      {
        src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
        fontWeight: 400,
      },
      {
        src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Bold.ttf",
        fontWeight: 700,
      },
    ],
  });
} catch {
  /* hot reload: шрифт уже зарегистрирован */
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSans",
    fontSize: 10,
    paddingTop: 42,
    paddingBottom: 48,
    paddingHorizontal: 44,
    lineHeight: 1.45,
  },
  h1: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  h2: { fontSize: 12, fontWeight: 700, marginTop: 12, marginBottom: 4 },
  muted: { fontSize: 9, color: "#555", marginBottom: 10 },
  box: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  row: { marginBottom: 3 },
  bullet: { marginLeft: 8, marginBottom: 2 },
});

function compliancePercent(analysis: SalesCallAnalysis): number {
  const items = analysis.scriptCompliance;
  if (!items.length) return 0;
  const done = items.filter((i) => i.completed).length;
  return Math.round((done / items.length) * 100);
}

export function AnalysisPdfDocument({ analysis }: { analysis: SalesCallAnalysis }) {
  const pct = compliancePercent(analysis);
  return (
    <Document
      title="Отчёт по продажному звонку"
      author="AI Sales Call Analyzer"
      language="ru"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Отчёт по анализу продажного звонка</Text>
        <Text style={styles.muted}>
          Документ сформирован автоматически. Содержит оценку качества, соответствие скрипту и
          рекомендации по развитию навыков менеджера.
        </Text>

        <Text style={styles.h2}>Общая оценка</Text>
        <Text style={styles.row}>
          Балл качества звонка: {analysis.overallScore} из 10. Соответствие скрипту: {pct}%.
        </Text>

        <Text style={styles.h2}>Краткое резюме</Text>
        <Text style={styles.box}>{analysis.summary}</Text>

        <Text style={styles.h2}>Соблюдение скрипта</Text>
        {analysis.scriptCompliance.map((item, i) => (
          <Text key={i} style={styles.bullet}>
            {item.completed ? "✓" : "○"} {item.stage}
            {item.comment ? ` — ${item.comment}` : ""}
          </Text>
        ))}

        <Text style={styles.h2}>Ошибки менеджера</Text>
        {analysis.mistakes.length ? (
          analysis.mistakes.map((m, i) => (
            <Text key={i} style={styles.bullet}>
              • {m}
            </Text>
          ))
        ) : (
          <Text style={styles.bullet}>Критичных ошибок не выявлено.</Text>
        )}

        <Text style={styles.h2}>Рекомендации по улучшению</Text>
        {analysis.recommendations.map((m, i) => (
          <Text key={i} style={styles.bullet}>
            • {m}
          </Text>
        ))}

        <Text style={styles.h2}>Сильные стороны звонка</Text>
        {analysis.strongMoments.length ? (
          analysis.strongMoments.map((m, i) => (
            <Text key={i} style={styles.bullet}>
              • {m}
            </Text>
          ))
        ) : (
          <Text style={styles.bullet}>Не выделено.</Text>
        )}

        <Text style={styles.h2}>Работа с возражениями</Text>
        <Text style={styles.box}>{analysis.objectionHandling}</Text>

        <Text style={styles.h2}>Анализ закрытия сделки</Text>
        <Text style={styles.box}>{analysis.closingAnalysis}</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Полная транскрипция разговора</Text>
        <Text style={styles.box}>{analysis.transcript}</Text>
      </Page>
    </Document>
  );
}
