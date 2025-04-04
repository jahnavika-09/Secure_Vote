import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useVoterVerification } from "@/hooks/use-voter-verification";
import { VerificationStepper } from "@/components/verification/verification-stepper";
import { IdentityVerification } from "@/components/verification/identity-verification";
import { EligibilityVerification } from "@/components/verification/eligibility-verification";
import { BiometricVerification } from "@/components/verification/biometric-verification";
import { OtpVerification } from "@/components/verification/otp-verification";
import { VoterInformation } from "@/components/verification/voter-information";
import { VerificationStatusComponent } from "@/components/verification/verification-status";
import { HelpCard } from "@/components/verification/help-card";
import { VerificationSteps } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Component to render based on the current verification step
const StepContent = ({ 
  currentStep, 
  onComplete,
  voterProfile,
  verificationStatus 
}: { 
  currentStep: string;
  onComplete: () => void;
  voterProfile: any;
  verificationStatus: Record<string, string>;
}) => {
  switch (currentStep) {
    case VerificationSteps.IDENTITY:
      return <IdentityVerification onVerificationComplete={onComplete} />;
    case VerificationSteps.ELIGIBILITY:
      return <EligibilityVerification onVerificationComplete={onComplete} />;
    case VerificationSteps.BIOMETRIC:
      return <BiometricVerification onVerificationComplete={onComplete} />;
    case VerificationSteps.OTP:
      return <OtpVerification onVerificationComplete={onComplete} />;
    case VerificationSteps.READY:
      const readyComplete = async () => {
        try {
          const response = await apiRequest("POST", "/api/verification/ready/complete", {});
          
          if (response.ok) {
            const data = await response.json();
            console.log("Ready complete response:", data);
            
            if (data.success) {
              onComplete();
              
              // Show success message
              toast({
                title: "Verification Complete",
                description: data.alreadyCompleted 
                  ? "Your verification was already completed. You are ready to vote!" 
                  : "Verification process completed successfully. You are now ready to vote!",
              });
            }
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Verification failed");
          }
        } catch (error) {
          console.error("Failed to complete READY step:", error);
          toast({
            title: "Verification Failed",
            description: error instanceof Error ? error.message : "An unknown error occurred",
            variant: "destructive",
          });
        }
      };
      
      return (
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Complete!</h2>
              <p className="text-green-600 text-lg mb-6">
                You are now eligible to vote
              </p>

              {voterProfile && (
                <div className="w-full max-w-lg bg-white rounded-lg border border-neutral-200 p-6 mb-6">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-4">Your Voter Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-500">Voter ID</p>
                      <p className="font-medium">{voterProfile.voterId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">District</p>
                      <p className="font-medium">{voterProfile.district}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Precinct</p>
                      <p className="font-medium">{voterProfile.precinct}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Registration Date</p>
                      <p className="font-medium">{voterProfile.registrationDate}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full max-w-lg bg-green-50 rounded-lg p-6 mb-6">
                <h3 className="font-medium text-neutral-900 mb-2">Verification Status:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-green-600">
                    <Check className="h-5 w-5 mr-2" />
                    Identity Verified
                  </li>
                  <li className="flex items-center text-green-600">
                    <Check className="h-5 w-5 mr-2" />
                    Eligibility Confirmed
                  </li>
                  <li className="flex items-center text-green-600">
                    <Check className="h-5 w-5 mr-2" />
                    Biometric Authentication Complete
                  </li>
                  <li className="flex items-center text-green-600">
                    <Check className="h-5 w-5 mr-2" />
                    Two-Factor Authentication Verified
                  </li>
                </ul>
              </div>

              {verificationStatus[VerificationSteps.READY] !== VerificationStatus.VERIFIED && (
                <Button onClick={readyComplete} size="lg" className="w-full max-w-md">
                  Confirm and Complete Verification
                </Button>
              )}

              {verificationStatus[VerificationSteps.READY] === VerificationStatus.VERIFIED && (
                <div className="text-center">
                  <div className="bg-green-50 rounded-lg p-6 mb-6">
                    <p className="text-lg font-medium text-green-600 mb-4">
                      🎉 Verification Successfully Completed
                    </p>
                    <p className="text-sm text-green-600 mb-6">
                      You are now eligible to vote. Cast your vote below!
                    </p>
                    <Button
                      onClick={async () => {
                        try {
                          await apiRequest("POST", "/api/vote/cast", {});
                          toast({
                            title: "Vote Cast Successfully",
                            description: "Thank you for participating in the election!",
                            variant: "default",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to cast vote. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Cast Your Vote
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col items-center text-center p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification in Progress</h2>
              <p className="text-gray-500 mb-6">Please wait while we verify your information.</p>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      );
  }
};

// Already importing CheckCircle from lucide-react

// StepStatus component
interface StepStatusProps {
  isCompleted: boolean;
  isCurrentStep: boolean;
}

const StepStatus = ({ isCompleted, isCurrentStep }: StepStatusProps) => {
  if (isCompleted) {
    return <CheckCircle className="h-5 w-5 text-success" />;
  }
  if (isCurrentStep) {
    return <Loader2 className="h-5 w-5 animate-spin text-warning" />;
  }
  return <div className="h-5 w-5 rounded-full bg-neutral-300" />;
};

export default function VerificationPage() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  
  // Check if user has a voter profile
  const { data: voterProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/voter-profile"],
  });
  
  // Handle error if no profile found
  useEffect(() => {
    if (!isLoadingProfile && !voterProfile) {
      // If no profile, we'll create a mock one
      setIsCreatingProfile(true);
    }
  }, [isLoadingProfile, voterProfile]);

  // Create a voter profile if none exists
  const createVoterProfile = async () => {
    if (!user) return;
    
    try {
      setIsCreatingProfile(true);
      
      // These would normally come from a form but we're creating a default profile for demo
      const mockProfile = {
        userId: user.id,
        voterId: `VID${Math.floor(100000 + Math.random() * 900000)}`,
        district: "Central District",
        age: 32,
        registrationDate: new Date().toLocaleDateString(),
        precinct: `P-${Math.floor(100 + Math.random() * 900)}`,
        isEligible: true
      };
      
      await apiRequest("POST", "/api/voter-profile", mockProfile);
      
      toast({
        title: "Profile Created",
        description: "Your voter profile has been created successfully.",
      });
      
      // Refresh the page to load the new profile
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create voter profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // Effect to create profile if needed
  useEffect(() => {
    if (!isLoadingProfile && !voterProfile && user && !isCreatingProfile) {
      createVoterProfile();
    }
  }, [isLoadingProfile, voterProfile, user, isCreatingProfile]);
  
  // Set up verification provider and get verification status
  return (
    <VerificationProvider>
      <VerificationPageContent 
        voterProfile={voterProfile} 
        isLoading={isLoadingProfile || isCreatingProfile}
        createVoterProfile={createVoterProfile}
        isCreatingProfile={isCreatingProfile}
      />
    </VerificationProvider>
  );
}

// Type to ensure we're using the right step type
type StepType = keyof typeof VerificationSteps;

// Wrapper for VerificationProvider to avoid circular dependency
function VerificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

// Main verification page content
function VerificationPageContent({ 
  voterProfile, 
  isLoading,
  createVoterProfile,
  isCreatingProfile
}: { 
  voterProfile: any;
  isLoading: boolean;
  createVoterProfile: () => Promise<void>;
  isCreatingProfile: boolean;
}) {
  const { toast } = useToast();
  const [hasStarted, setHasStarted] = useState(false);
  
  // Verification status state
  const [verificationStatus, setVerificationStatus] = useState<Record<string, string>>({
    [VerificationSteps.IDENTITY]: "pending",
    [VerificationSteps.ELIGIBILITY]: "pending",
    [VerificationSteps.BIOMETRIC]: "pending",
    [VerificationSteps.OTP]: "pending",
    [VerificationSteps.READY]: "pending"
  });
  
  const [currentStep, setCurrentStep] = useState<keyof typeof VerificationSteps>("IDENTITY" as keyof typeof VerificationSteps);
  
  // Fetch verification status from server
  const { data: verificationSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/verification"],
    enabled: !isLoading && !!voterProfile
  });

  // Process verification sessions when data changes
  useEffect(() => {
    const sessions = verificationSessions;
    if (sessions && Array.isArray(sessions) && sessions.length > 0) {
        // Update state with the latest session information
        const newStatus = {
          [VerificationSteps.IDENTITY]: "pending",
          [VerificationSteps.ELIGIBILITY]: "pending",
          [VerificationSteps.BIOMETRIC]: "pending",
          [VerificationSteps.OTP]: "pending",
          [VerificationSteps.READY]: "pending"
        };
        let foundInProgress = false;
        
        // Process sessions to determine current state
        sessions.forEach((session: any) => {
          // Cast the step to a valid key of VerificationSteps
          const step = session.step as keyof typeof VerificationSteps;
          newStatus[step] = session.status;
          
          // Set current step to the latest in-progress step
          if (session.status === "in_progress" && !foundInProgress) {
            setCurrentStep(step);
            foundInProgress = true;
            setHasStarted(true);
          }
        });
        
        // Check if identity and eligibility are verified
        if (newStatus[VerificationSteps.IDENTITY] === "verified" && 
            newStatus[VerificationSteps.ELIGIBILITY] === "verified") {
          // If biometric is next and not in progress
          if (newStatus[VerificationSteps.BIOMETRIC] === "pending") {
            setCurrentStep("BIOMETRIC" as keyof typeof VerificationSteps);
          }
        }
        
        setVerificationStatus(newStatus);
      }
  }, [verificationSessions]); // Remove verificationStatus from dependencies
  
  // Start verification process
  const startVerification = async () => {
    try {
      const response = await apiRequest("POST", "/api/verification/start", {});
      if (response.ok) {
        setHasStarted(true);
        
        // Start with identity verification
        setCurrentStep("IDENTITY" as keyof typeof VerificationSteps);
        setVerificationStatus({
          [VerificationSteps.IDENTITY]: "in_progress",
          [VerificationSteps.ELIGIBILITY]: "pending",
          [VerificationSteps.BIOMETRIC]: "pending",
          [VerificationSteps.OTP]: "pending",
          [VerificationSteps.READY]: "pending"
        });
        
        toast({
          title: "Verification Started",
          description: "Your verification process has been initiated. Complete each step manually to proceed.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start verification. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Complete a verification step
  const completeStep = async (step: string) => {
    try {
      // Get next step
      const steps = Object.values(VerificationSteps);
      const currentIndex = steps.indexOf(step as any);
      if (currentIndex === -1 || currentIndex === steps.length - 1) {
        throw new Error("Invalid step");
      }
      
      const nextStep = steps[currentIndex + 1];
      
      // Call API to move to next step
      // The API expects the NEXT step name, not the current one being completed
      const nextStepLowercase = nextStep.toLowerCase();
      console.log(`Completing step ${step} by calling API with next step: ${nextStepLowercase}`);
      const response = await apiRequest("POST", `/api/verification/step/${nextStepLowercase}`, {});
      
      if (response.ok) {
        // Update verification status
        setVerificationStatus(prevStatus => ({
          ...prevStatus,
          [step]: "verified",
          [nextStep]: "in_progress",
        }));
        
        setCurrentStep(nextStep as keyof typeof VerificationSteps);
        
        toast({
          title: "Step Completed",
          description: `${step} verification completed successfully.`,
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete verification step. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle step completion
  const handleStepComplete = () => {
    completeStep(currentStep);
  };
  
  // Navigation buttons
  const handlePreviousStep = () => {
    const steps = Object.values(VerificationSteps);
    const currentIndex = steps.indexOf(currentStep as any);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as keyof typeof VerificationSteps);
    }
  };
  
  const handleNextStep = () => {
    const steps = Object.values(VerificationSteps);
    const currentIndex = steps.indexOf(currentStep as any);
    
    if (currentIndex < steps.length - 1) {
      // Only allow moving to next step if current step is verified
      if (verificationStatus[currentStep] === "verified") {
        setCurrentStep(steps[currentIndex + 1] as keyof typeof VerificationSteps);
      }
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex justify-center items-center" style={{ minHeight: 'calc(100vh - 20rem)' }}>
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium text-gray-900">Loading voter information...</p>
          </div>
        </div>
      </main>
    );
  }
  
  // No voter profile found
  if (!voterProfile) {
    return (
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex justify-center items-center" style={{ minHeight: 'calc(100vh - 20rem)' }}>
          <div className="bg-white shadow sm:rounded-lg overflow-hidden p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Voter Profile Found</h2>
              <p className="text-gray-500 mb-6">You need to create a voter profile before continuing with verification.</p>
              <Button onClick={createVoterProfile} disabled={isCreatingProfile}>
                {isCreatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Voter Profile'
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex-grow">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-neutral-900">Voter Verification System</h1>
          <p className="mt-1 text-sm text-neutral-600">Secure, transparent, and efficient voter verification</p>
        </div>

        {/* Verification Stepper */}
        <VerificationStepper 
          currentStep={currentStep} 
          verificationStatus={verificationStatus} 
        />

        {/* Main Content */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Panel - Current Verification Step */}
            <div>
              {!hasStarted ? (
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-6">
                      Start Verification Process
                    </h2>
                    <p className="mb-6 text-sm text-neutral-600">
                      Welcome to the secure voter verification system. This process will verify your identity and eligibility to vote using multiple factors of authentication.
                    </p>
                    <Button 
                      onClick={startVerification} 
                      className="w-full"
                    >
                      Begin Verification
                    </Button>
                  </div>
                </div>
              ) : (
                <StepContent 
                  currentStep={currentStep} 
                  onComplete={handleStepComplete}
                  voterProfile={voterProfile}
                  verificationStatus={verificationStatus}
                />
              )}
            </div>
            
            {/* Right Panel - Verification Status & Information */}
            <div>
              {/* Voter Information Card - Only show after all steps are verified */}
              {voterProfile && 
                verificationStatus[VerificationSteps.READY] === "verified" && 
                <VoterInformation voterProfile={voterProfile} />
              }
              
              {/* Verification Status Card */}
              <VerificationStatusComponent verificationStatus={verificationStatus} />
              
              {/* Restart Button */}
              <Button 
                variant="destructive" 
                className="w-full mt-4"
                onClick={() => {
                  logoutMutation.mutate();
                  navigate("/auth");
                }}
              >
                Restart Verification Process
              </Button>
              
              {/* Need Help Card */}
              <HelpCard />
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        {hasStarted && (
          <div className="mt-6 px-4 py-3 bg-neutral-50 border-t border-neutral-200 sm:px-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePreviousStep}
              disabled={currentStep === VerificationSteps.IDENTITY}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Step
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={
                verificationStatus[currentStep] !== "verified" || 
                currentStep === VerificationSteps.READY
              }
            >
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}


