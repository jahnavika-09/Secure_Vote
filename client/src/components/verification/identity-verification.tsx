import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, Shield, CameraIcon, Upload, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface IdentityVerificationProps {
  onVerificationComplete: () => void;
}

export function IdentityVerification({ onVerificationComplete }: IdentityVerificationProps) {
  const [verifying, setVerifying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [idPhotoUploaded, setIdPhotoUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const { toast } = useToast();

  const handleIdUpload = () => {
    setIdPhotoUploaded(true);
    toast({
      title: "ID Document Uploaded",
      description: "Your ID document has been uploaded successfully",
    });
  };

  const handleSelfieUpload = () => {
    setSelfieUploaded(true);
    toast({
      title: "Selfie Uploaded",
      description: "Your selfie has been uploaded successfully",
    });
  };

  const isFormValid = () => {
    return (
      fullName.length >= 3 && 
      idNumber.length >= 6 && 
      dateOfBirth !== "" && 
      idPhotoUploaded && 
      selfieUploaded
    );
  };

  const handleVerify = async () => {
    if (!isFormValid()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill all required fields and upload all documents",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    setFailed(false);
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setVerifying(false);
      setVerificationComplete(true);
      toast({
        title: "Identity Verified",
        description: "Your identity documents have been verified successfully",
        variant: "default",
      });
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

  const handleComplete = () => {
    if (verificationComplete) {
      onVerificationComplete();
    } else {
      toast({
        title: "Verification Required",
        description: "Please complete the verification process first",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <UserCheck className="mr-2 text-primary" />
          Identity Verification
        </h2>
        
        <p className="mb-6 text-sm text-neutral-600">
          We need to verify your identity to ensure you are who you claim to be. Please provide the following information and upload the required documents.
        </p>
        
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-6">
          <div className="flex items-start">
            <Shield className="text-primary mr-2 text-sm h-4 w-4 mt-0.5" />
            <div className="text-xs text-neutral-700">
              Your identity information is securely encrypted and will be compared against official records to confirm your identity.
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name (as on ID)</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Enter your full legal name"
                disabled={verificationComplete}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="idNumber">ID Number / Passport Number</Label>
              <Input 
                id="idNumber" 
                value={idNumber} 
                onChange={(e) => setIdNumber(e.target.value)} 
                placeholder="Enter your ID or passport number"
                disabled={verificationComplete}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input 
                id="dateOfBirth" 
                type="date" 
                value={dateOfBirth} 
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={verificationComplete}
              />
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <h3 className="text-md font-medium text-neutral-900 mb-4">Document Upload</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className={`cursor-pointer ${idPhotoUploaded ? 'border-green-500' : ''}`}>
            <CardContent className="pt-4 flex flex-col items-center">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                  idPhotoUploaded ? 'bg-green-100' : 'bg-neutral-100'
                }`}
                onClick={handleIdUpload}
              >
                {idPhotoUploaded ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <Upload className="h-8 w-8 text-neutral-600" />
                )}
              </div>
              <p className="text-sm font-medium text-center">ID Document</p>
              <p className="text-xs text-neutral-500 text-center mt-1">Upload a clear photo of your ID</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full"
                onClick={handleIdUpload}
                disabled={idPhotoUploaded || verificationComplete}
              >
                {idPhotoUploaded ? 'Uploaded' : 'Upload'}
              </Button>
            </CardContent>
          </Card>
          
          <Card className={`cursor-pointer ${selfieUploaded ? 'border-green-500' : ''}`}>
            <CardContent className="pt-4 flex flex-col items-center">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                  selfieUploaded ? 'bg-green-100' : 'bg-neutral-100'
                }`}
                onClick={handleSelfieUpload}
              >
                {selfieUploaded ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <CameraIcon className="h-8 w-8 text-neutral-600" />
                )}
              </div>
              <p className="text-sm font-medium text-center">Selfie</p>
              <p className="text-xs text-neutral-500 text-center mt-1">Take a clear selfie of your face</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full"
                onClick={handleSelfieUpload}
                disabled={selfieUploaded || verificationComplete}
              >
                {selfieUploaded ? 'Uploaded' : 'Take Photo'}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {failed && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
            <div className="flex items-start">
              <X className="text-red-600 mr-2 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Identity verification failed
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Please check your information and try again. Make sure your documents are clear and match your provided details.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {verificationComplete && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
            <div className="flex items-start">
              <CheckCircle2 className="text-green-600 mr-2 h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Identity verification successful
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Your identity has been verified successfully. You can now proceed to the next step.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col space-y-3">
          {!verificationComplete ? (
            <Button
              onClick={handleVerify}
              disabled={verifying || !isFormValid()}
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
          ) : (
            <Button
              onClick={handleComplete}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete & Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}