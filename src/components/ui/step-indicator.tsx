import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  currentStep: number;
  completedSteps: number[];
}

export const StepIndicator = ({ steps, currentStep, completedSteps }: StepIndicatorProps) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative">
            <div className="flex items-start">
              {/* Step Circle */}
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="ml-4 flex-1 min-w-0">
                <div
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </div>
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className="absolute left-4 top-8 w-px h-6 bg-border transform -translate-x-1/2" />
            )}
          </div>
        );
      })}
    </div>
  );
};