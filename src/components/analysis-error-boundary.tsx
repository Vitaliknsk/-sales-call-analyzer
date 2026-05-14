"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type State = { hasError: boolean };

export class AnalysisErrorBoundary extends React.Component<
  React.PropsWithChildren<{ onReset?: () => void }>,
  State
> {
  constructor(props: React.PropsWithChildren<{ onReset?: () => void }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("AnalysisErrorBoundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-8 text-center">
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            Произошла ошибка отображения отчёта
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Попробуйте выполнить анализ снова или обновите страницу.
          </p>
          <Button
            type="button"
            className="mt-6"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset?.();
            }}
          >
            Сбросить и начать заново
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
