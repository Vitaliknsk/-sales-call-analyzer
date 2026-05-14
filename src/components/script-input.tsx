"use client";

import { motion } from "framer-motion";
import { Eraser } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const MAX_CHARS = 120_000;

type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

export function ScriptInput({ value, onChange, disabled }: Props) {
  const len = value.length;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="sales-script">Скрипт продаж</Label>
        <span className="text-xs text-muted-foreground">
          {len.toLocaleString("ru-RU")} / {MAX_CHARS.toLocaleString("ru-RU")}
        </span>
      </div>
      <Textarea
        id="sales-script"
        disabled={disabled}
        placeholder="Вставьте скрипт продаж (этапы, фразы, вопросы для квалификации клиента)..."
        value={value}
        maxLength={MAX_CHARS}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[220px] resize-y"
      />
      <motion.div whileHover={{ scale: disabled ? 1 : 1.01 }} whileTap={{ scale: disabled ? 1 : 0.99 }}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !value}
          onClick={() => onChange("")}
        >
          <Eraser className="mr-2 h-4 w-4" />
          Очистить
        </Button>
      </motion.div>
    </div>
  );
}
