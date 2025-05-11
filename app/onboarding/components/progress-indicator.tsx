import { useEffect, useState } from "react";

interface ProgressIndicatorProps {
  currentStep: number; // 0-based index
  totalSteps?: number; // default 4
}

export default function ProgressIndicator({
  currentStep,
  totalSteps = 4,
}: ProgressIndicatorProps) {
  const [segmentProgress, setSegmentProgress] = useState<number[]>(
    Array(totalSteps).fill(0)
  );

  useEffect(() => {
    // Instantly fill previous steps, animate current
    const filled = Array(totalSteps)
      .fill(100)
      .map((v, i) => (i < currentStep ? 100 : 0));
    setSegmentProgress(filled);
    setTimeout(() => {
      setSegmentProgress(
        Array(totalSteps)
          .fill(100)
          .map((v, i) => (i < currentStep ? 100 : i === currentStep ? 100 : 0))
      );
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, totalSteps]);

  return (
    <div className="flex gap-2">
      {Array(totalSteps)
        .fill(0)
        .map((_, step) => (
          <div
            key={step}
            className="h-1.5 w-20 max-sm:w-16 rounded-full bg-gray-200 overflow-hidden"
            style={{ position: "relative" }}
          >
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{
                width: `${segmentProgress[step]}%`,
                transition:
                  segmentProgress[step] === 100 && step < currentStep
                    ? "none"
                    : "width 0.7s cubic-bezier(0.4,0,0.2,1)",
              }}
            ></div>
          </div>
        ))}
    </div>
  );
}
