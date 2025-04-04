import { create } from "zustand";
import { apiRequest } from "@/lib/utils";
import { VerificationSteps, VerificationStatus } from "@shared/schema";

interface VerificationState {
  currentStep: string;
  verificationStatus: Record<string, string>;
  setCurrentStep: (step: string) => void;
  updateVerificationStatus: (step: string, status: string) => void;
  submitVerification: (step: string, data: any) => Promise<void>;
  resetVerification: () => Promise<void>; // Added reset functionality
}

export const useVoterVerification = create<VerificationState>((set, get) => ({
  currentStep: VerificationSteps.IDENTITY,
  verificationStatus: {},
  setCurrentStep: (step) => set({ currentStep: step }),
  updateVerificationStatus: (step, status) =>
    set((state) => ({
      verificationStatus: { ...state.verificationStatus, [step]: status },
    })),
  submitVerification: async (step, data) => {
    try {
      const response = await apiRequest("POST", `/api/verification/${step.toLowerCase()}`, data);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      set((state) => ({
        verificationStatus: { ...state.verificationStatus, [step]: response.status },
      }));
    } catch (error) {
      console.error("Error submitting verification:", error);
      // Handle error appropriately, e.g., display an error message
      set((state) => ({
        verificationStatus: { ...state.verificationStatus, [step]: "error" },
      }));
    }
  },
  resetVerification: async () => {
    try {
      const response = await apiRequest("POST", "/api/verification/reset", {});
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      set({
        currentStep: VerificationSteps.IDENTITY,
        verificationStatus: {
          [VerificationSteps.IDENTITY]: "pending",
          [VerificationSteps.ELIGIBILITY]: "pending",
          [VerificationSteps.BIOMETRIC]: "pending",
          [VerificationSteps.OTP]: "pending",
          [VerificationSteps.READY]: "pending",
        },
      });
    } catch (error) {
      console.error("Error resetting verification:", error);
      // Handle error appropriately
    }
  },
}));