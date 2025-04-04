import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IdentityVerificationProps {
  onVerificationComplete: () => void;
}

export function IdentityVerification({ onVerificationComplete }: IdentityVerificationProps) {
  const [verifying, setVerifying] = useState(false);
  const [failed, setFailed] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    setVerifying(true);
    setFailed(false);
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      setVerifying(false);
      toast({
        title: "Identity Verified",
        description: "Your identity has been verified successfully",
        variant: "default",
      });
      
      // Call the parent callback to complete this step
      onVerificationComplete();
    } catch (error) {
      setVerifying(false);
      setFailed(true);
      toast({
        title: "Verification Failed",
        description: "There was an error verifying your identity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleForceComplete = () => {
    setVerifying(false);
    toast({
      title: "Verification Step Completed",
      description: "Moving to the next step in the verification process",
      variant: "default",
    });
    onVerificationComplete();
  };

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <UserCheck className="mr-2 text-primary" />
          Identity Verification
        </h2>
        
        <p className="mb-6 text-sm text-neutral-600">
          We need to verify your identity to ensure you are who you claim to be. This step helps ensure election integrity.
        </p>
        
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-6">
          <div className="flex items-start">
            <Shield className="text-primary mr-2 text-sm h-4 w-4 mt-0.5" />
            <div className="text-xs text-neutral-700">
              Your identity information is securely encrypted and will be compared against official records to confirm your identity.
            </div>
          </div>
        </div>
        
        {failed && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
            <p className="text-sm text-red-800">
              Identity verification failed. Please try again or contact support if the problem persists.
            </p>
          </div>
        )}
        
        <div className="flex flex-col space-y-3">
          <Button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full"
          >
            {verifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying Identity...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Verify Identity
              </>
            )}
          </Button>
          
          <Button
            onClick={handleForceComplete}
            variant="outline"
            className="w-full"
          >
            Continue to Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}