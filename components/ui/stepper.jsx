import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({ steps, currentStep = 0 }) {
  return (
    <div className="grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
      {steps.map((step, index) => {
        const complete = index < currentStep;
        const active = index === currentStep;
        return (
          <div key={step.id || step.title} className="flex items-start gap-3 rounded-[1.4rem] border border-input bg-card p-4">
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                complete && "border-success bg-success text-white",
                active && "border-primary bg-primary text-primary-foreground",
                !complete && !active && "border-input bg-muted text-muted-foreground",
              )}
            >
              {complete ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <div>
              <p className="font-medium text-foreground">{step.title}</p>
              {step.description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
