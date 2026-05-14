"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="text-lg font-semibold">Что-то пошло не так</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Произошла непредвиденная ошибка. Попробуйте обновить страницу или повторить действие позже.
      </p>
      <Button type="button" className="mt-8" onClick={() => reset()}>
        Попробовать снова
      </Button>
    </div>
  );
}
