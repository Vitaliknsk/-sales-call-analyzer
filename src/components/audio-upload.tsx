"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileAudio, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ACCEPT = "audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/m4a,.mp3,.wav,.m4a";

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onValidationError?: (message: string) => void;
  disabled?: boolean;
};

export function AudioUpload({
  file,
  onFileChange,
  onValidationError,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const validateAndSet = useCallback(
    (f: File) => {
      const name = f.name.toLowerCase();
      if (!name.endsWith(".mp3") && !name.endsWith(".wav") && !name.endsWith(".m4a")) {
        onValidationError?.("Допустимые форматы: MP3, WAV, M4A");
        return;
      }
      onFileChange(f);
    },
    [onFileChange, onValidationError]
  );

  const onPick = (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    validateAndSet(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    onPick(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          onPick(e.target.files);
          e.target.value = "";
        }}
      />

      <motion.div
        layout
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-all",
          dragOver
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border/80 bg-card/40 hover:border-primary/50 hover:bg-accent/20",
          disabled && "pointer-events-none opacity-60"
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Зона загрузки аудио"
      >
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <FileAudio className="h-12 w-12 text-primary" />
              <p className="max-w-full truncate px-2 text-sm font-medium text-foreground">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} МБ
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Заменить файл
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileChange(null);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить файл
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-base font-medium text-foreground">
                Перетащите аудиофайл сюда
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Форматы: MP3, WAV, M4A. Максимальный размер для MVP — 25 МБ.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-2"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                Выбрать файл
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
