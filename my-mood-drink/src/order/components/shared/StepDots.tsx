interface StepDotsProps {
  step: number;
  total?: number;
}

export function StepDots({ step, total = 4 }: StepDotsProps) {
  return (
    <div className="flex gap-1.5 justify-center py-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === step ? "w-6 bg-neutral-800" : "w-1.5 bg-neutral-800/20"
          }`}
        />
      ))}
    </div>
  );
}
