import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { VerificationSteps, VerificationStatus, VerificationSession, VoterProfile } from "@shared/schema";

interface VerificationContextType {
  currentStep: string;
  verificationStatus: Record<string, any>;
  voterProfile: VoterProfile | null;
  isLoading: boolean;
  startVerification: () => void;
  completeStep: (step: string) => void;
  isStepCompleted: (step: string) => boolean;
}

const VerificationContext = createContext<VerificationContextType | null>(null);

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<string>(VerificationSteps.IDENTITY);
  // Using any string for the status value to handle values from backend and constants
  const [verificationStatus, setVerificationStatus] = useState<Record<string, any>>({
    [VerificationSteps.IDENTITY]: VerificationStatus.PENDING,
    [VerificationSteps.ELIGIBILITY]: VerificationStatus.PENDING,
    [VerificationSteps.BIOMETRIC]: VerificationStatus.PENDING,
    [VerificationSteps.OTP]: VerificationStatus.PENDING,
    [VerificationSteps.READY]: VerificationStatus.PENDING,
  });

  // Fetch voter profile
  const { data: voterProfile, isLoading: isLoadingProfile } = useQuery<VoterProfile>({
    queryKey: ["/api/voter-profile"],
  });

  // Fetch verification sessions
  const { data: verificationSessions, isLoading: isLoadingSessions } = useQuery<VerificationSession[]>({
    queryKey: ["/api/verification"],
  });

  // Process verification sessions when data changes
  useEffect(() => {
    if (verificationSessions && verificationSessions.length > 0) {
      // Update the UI state with the latest session information
      const newStatus: Record<string, any> = {
        [VerificationSteps.IDENTITY]: VerificationStatus.PENDING,
        [VerificationSteps.ELIGIBILITY]: VerificationStatus.PENDING,
        [VerificationSteps.BIOMETRIC]: VerificationStatus.PENDING,
        [VerificationSteps.OTP]: VerificationStatus.PENDING,
        [VerificationSteps.READY]: VerificationStatus.PENDING
      };
      
      // Process all sessions to build current state
      for (const session of verificationSessions) {
        // Cast the step to a valid key of VerificationSteps
        const step = session.step as keyof typeof VerificationSteps;
        // Ensure status is one of the valid verification statuses
        newStatus[step] = session.status as (typeof VerificationStatus)[keyof typeof VerificationStatus];
        
        // Set current step to the latest in-progress step
        if (session.status === VerificationStatus.IN_PROGRESS) {
          setCurrentStep(step);
        }
      }
      
      // Set the verification status
      setVerificationStatus(newStatus);
    } else {
      // If no verification sessions, reset to initial state
      setVerificationStatus({
        [VerificationSteps.IDENTITY]: VerificationStatus.PENDING,
        [VerificationSteps.ELIGIBILITY]: VerificationStatus.PENDING,
        [VerificationSteps.BIOMETRIC]: VerificationStatus.PENDING,
        [VerificationSteps.OTP]: VerificationStatus.PENDING,
        [VerificationSteps.READY]: VerificationStatus.PENDING
      });
      setCurrentStep(VerificationSteps.IDENTITY);
    }
  }, [verificationSessions]);

  const startVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/verification/start", {});
      return await response.json();
    },
    onSuccess: (data) => {
      // Update verification status
      setVerificationStatus({
        [VerificationSteps.IDENTITY]: VerificationStatus.IN_PROGRESS,
        [VerificationSteps.ELIGIBILITY]: VerificationStatus.PENDING,
        [VerificationSteps.BIOMETRIC]: VerificationStatus.PENDING,
        [VerificationSteps.OTP]: VerificationStatus.PENDING,
        [VerificationSteps.READY]: VerificationStatus.PENDING
      });
      setCurrentStep(VerificationSteps.IDENTITY);
      
      // Invalidate verification sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/verification"] });
      
      toast({
        title: "Verification Started",
        description: "Your voter verification process has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start verification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeStepMutation = useMutation({
    mutationFn: async (step: string) => {
      // Get next step
      const steps = Object.values(VerificationSteps);
      const currentIndex = steps.indexOf(step as any);
      if (currentIndex === -1 || currentIndex === steps.length - 1) {
        throw new Error("Invalid step");
      }
      
      const nextStep = steps[currentIndex + 1];
      
      // Call the API to move to the next step
      const response = await apiRequest("POST", `/api/verification/step/${nextStep}`, {});
      return await response.json();
    },
    onSuccess: (data, step) => {
      // Update verification status
      const steps = Object.values(VerificationSteps);
      const currentIndex = steps.indexOf(step as any);
      
      if (currentIndex !== -1 && currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];
        
        setVerificationStatus(prevStatus => ({
          ...prevStatus,
          [step]: VerificationStatus.VERIFIED,
          [nextStep]: VerificationStatus.IN_PROGRESS,
        }));
        
        setCurrentStep(nextStep);
      }
      
      // Invalidate verification sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/verification"] });
      
      toast({
        title: "Step Completed",
        description: `${step} verification completed successfully.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete verification step. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startVerification = () => {
    startVerificationMutation.mutate();
  };

  const completeStep = (step: string) => {
    // Get the next step to pass to the mutation
    const steps = Object.values(VerificationSteps);
    const currentIndex = steps.indexOf(step as any);
    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      console.error("Invalid step or last step reached");
      return;
    }
    
    const nextStep = steps[currentIndex + 1];
    console.log(`In hook: Completing step ${step} by passing next step ${nextStep}`);
    
    // Mutate with the next step
    completeStepMutation.mutate(nextStep);
  };

  const isStepCompleted = (step: string) => {
    return verificationStatus[step] === VerificationStatus.VERIFIED;
  };

  return (
    <VerificationContext.Provider
      value={{
        currentStep,
        verificationStatus,
        voterProfile: voterProfile || null,
        isLoading: isLoadingProfile || isLoadingSessions,
        startVerification,
        completeStep,
        isStepCompleted,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVoterVerification() {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error("useVoterVerification must be used within a VerificationProvider");
  }
  return context;
}
