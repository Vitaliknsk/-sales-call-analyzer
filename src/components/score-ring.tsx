"use client";

import { motion } from "framer-motion";

type Props = {
  score: number;
  label?: string;
  sublabel?: string;
};

export function ScoreRing({ score, label = "Общая оценка", sublabel = "Качество звонка" }: Props) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="relative h-40 w-40">
        <svg className="-rotate-90 transform" width="160" height="160" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={r}
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            className="text-muted/30"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={r}
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            className="text-primary"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold tracking-tight"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">из 10</span>
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground">{sublabel}</p>
    </div>
  );
}
