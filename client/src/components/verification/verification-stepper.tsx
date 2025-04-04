import React from "react";
import { cn } from "@/lib/utils";
import { User, ShieldCheck, Fingerprint, MessageSquare, Vote } from "lucide-react";
import { VerificationSteps, VerificationStatus } from "@shared/schema";

interface VerificationStepProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  active?: boolean;
  completed?: boolean;
  isCurrentStep?: boolean;
}

const VerificationStep = ({
  icon,
  label,
  sublabel,
  active = false,
  completed = false,
  isCurrentStep = false,
}: VerificationStepProps) => {
  return (
    <div className="flex flex-col items-center relative" data-step={label}>
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center z-10",
          active || completed ? "bg-primary" : "bg-neutral-200",
          isCurrentStep && "pulse-animation"
        )}
      >
        {icon}
      </div>
      <p className={cn(
        "mt-2 text-xs text-center font-medium",
        active || completed ? "text-neutral-900" : "text-neutral-400"
      )}>
        {label}
        {sublabel && <br />}
        {sublabel}
      </p>
    </div>
  );
};

export interface VerificationStepperProps {
  currentStep: string;
  verificationStatus: Record<string, string>;
}

export function VerificationStepper({
  currentStep,
  verificationStatus,
}: VerificationStepperProps) {
  const steps = [
    {
      step: VerificationSteps.IDENTITY,
      icon: <User className="h-4 w-4 text-white" />,
      label: "Identity",
      sublabel: "Verification",
    },
    {
      step: VerificationSteps.ELIGIBILITY,
      icon: <ShieldCheck className="h-4 w-4 text-white" />,
      label: "Eligibility",
      sublabel: "Check",
    },
    {
      step: VerificationSteps.BIOMETRIC,
      icon: <Fingerprint className="h-4 w-4 text-white" />,
      label: "Biometric",
      sublabel: "Authentication",
    },
    {
      step: VerificationSteps.OTP,
      icon: <MessageSquare className="h-4 w-4 text-white" />,
      label: "OTP",
      sublabel: "Verification",
    },
    {
      step: VerificationSteps.READY,
      icon: <Vote className="h-4 w-4 text-white" />,
      label: "Ready",
      sublabel: "to Vote",
    },
  ];

  // Determine which steps are active and completed
  const currentStepIndex = steps.findIndex((s) => s.step === currentStep);

  return (
    <div className="px-4 py-2 sm:px-0">
      <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Verification Process</h2>

          <div className="flex items-center w-full mb-8">
            {steps.map((step, index) => (
              <div key={step.step} className="flex items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      "flex-auto mx-2 h-0.5",
                      index <= currentStepIndex ? "bg-primary" : "bg-neutral-200"
                    )}
                    aria-hidden="true"
                  />
                )}
                <VerificationStep
                  icon={step.icon}
                  label={step.label}
                  sublabel={step.sublabel}
                  active={index <= currentStepIndex}
                  completed={
                    verificationStatus[step.step] === VerificationStatus.VERIFIED
                  }
                  isCurrentStep={step.step === currentStep}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
