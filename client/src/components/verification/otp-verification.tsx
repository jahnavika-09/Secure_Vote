import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { MessageSquare, Repeat, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OtpVerificationProps {
  onVerificationComplete: () => void;
}

export function OtpVerification({ onVerificationComplete }: OtpVerificationProps) {
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  const handleGenerateOtp = async () => {
    try {
      setIsGenerating(true);
      const response = await apiRequest("POST", "/api/verification/otp/generate", {});
      const data = await response.json();
      
      setGeneratedOtp(data.otp);
      toast({
        title: "OTP Generated",
        description: "A verification code has been generated. In a real system, this would be sent to your phone.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate OTP",
        description: "There was an error generating the verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({
        title: "OTP Required",
        description: "Please enter the verification code to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVerifying(true);
      const response = await apiRequest("POST", "/api/verification/otp/verify", { otp });
      
      if (response.ok) {
        toast({
          title: "OTP Verified",
          description: "Your identity has been successfully verified.",
          variant: "success",
        });
        onVerificationComplete();
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "The verification code is incorrect or has expired. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpComplete = (code: string) => {
    setOtp(code);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle>OTP Verification</CardTitle>
        </div>
        <CardDescription>
          Confirm your identity with a one-time password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {generatedOtp ? (
          <>
            <div className="bg-blue-50 p-4 rounded-md flex items-start space-x-3">
              <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Verification code generated</p>
                <p className="text-sm text-blue-700 mt-1">
                  In a real application, the code would be sent to your phone. For this demo, your code is:
                </p>
                <p className="text-lg font-bold text-blue-900 mt-1">{generatedOtp}</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Enter the 6-digit verification code</p>
              <div className="flex justify-center">
                <OtpInput 
                  length={6} 
                  onComplete={handleOtpComplete} 
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm" 
                onClick={handleGenerateOtp}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Repeat className="mr-2 h-4 w-4" />
                    Resend code
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-neutral-50 p-4 rounded-md flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-neutral-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-800">Verification required</p>
              <p className="text-sm text-neutral-600 mt-1">
                To complete your verification, we'll send a one-time password to your registered phone number.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled={isGenerating || isVerifying}>
          Need help?
        </Button>
        {generatedOtp ? (
          <Button 
            onClick={handleVerifyOtp} 
            disabled={otp.length !== 6 || isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleGenerateOtp} 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Send Verification Code'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
