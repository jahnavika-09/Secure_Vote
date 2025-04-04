import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Shield, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  HelpCircle,
  MapPin,
  CalendarDays,
  UserCheck,
  Building,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface EligibilityVerificationProps {
  onVerificationComplete: () => void;
}

export function EligibilityVerification({ onVerificationComplete }: EligibilityVerificationProps) {
  const [verifying, setVerifying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const { toast } = useToast();
  
  // Form states
  const [zipCode, setZipCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [voterIDNumber, setVoterIDNumber] = useState("");
  const [citizenshipStatus, setCitizenshipStatus] = useState<string | undefined>();
  const [ageConfirmation, setAgeConfirmation] = useState(false);
  const [residencyDuration, setResidencyDuration] = useState<string | undefined>();
  const [felonyStatus, setFelonyStatus] = useState<string | undefined>();
  const [mentalCapacity, setMentalCapacity] = useState<string | undefined>();
  
  // Validation
  const isFormValid = () => {
    return (
      zipCode.length === 5 &&
      /^\d{5}$/.test(zipCode) &&
      dateOfBirth !== "" &&
      voterIDNumber.length >= 5 &&
      citizenshipStatus === "yes" &&
      ageConfirmation &&
      residencyDuration !== undefined &&
      felonyStatus !== undefined &&
      mentalCapacity === "yes"
    );
  };

  const handleVerify = async () => {
    if (!isFormValid()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields to verify your eligibility.",
        variant: "destructive",
      });
      return;
    }
    
    setVerifying(true);
    setFailed(false);
    
    try {
      // Simulate a verification process with progress
      const totalSteps = 5;
      for (let step = 1; step <= totalSteps; step++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setVerificationProgress(Math.floor((step / totalSteps) * 100));
      }
      
      // Validation checks
      const isValidAge = new Date(dateOfBirth).getFullYear() <= (new Date().getFullYear() - 18);
      const isValidZipCode = /^\d{5}$/.test(zipCode);
      
      if (!isValidAge || !isValidZipCode || felonyStatus === "current" || citizenshipStatus === "no") {
        throw new Error("Eligibility criteria not met");
      }
      
      // Success
      setVerifying(false);
      setVerificationComplete(true);
      toast({
        title: "Eligibility Confirmed",
        description: "Your voter eligibility has been verified successfully. You can now proceed to the next step.",
        variant: "default",
      });
      
    } catch (error) {
      setVerifying(false);
      setFailed(true);
      toast({
        title: "Verification Failed",
        description: "We couldn't verify your eligibility. Please check your information or contact your local election office.",
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
        description: "Please complete the eligibility verification process first.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <ShieldCheck className="mr-2 text-primary" />
          Eligibility Verification
        </h2>
        
        <p className="mb-6 text-sm text-neutral-600">
          We need to confirm your voter eligibility based on your registration status and district information.
          Please complete all fields below to verify your eligibility to vote.
        </p>
        
        {verifying && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Verifying eligibility...</span>
              <span className="text-sm text-neutral-500">{verificationProgress}%</span>
            </div>
            <Progress value={verificationProgress} className="h-2" />
          </div>
        )}
        
        {verificationComplete && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Eligibility Verified</AlertTitle>
            <AlertDescription className="text-green-700">
              Your voter eligibility has been verified successfully. You can now proceed to the next step.
            </AlertDescription>
          </Alert>
        )}
        
        {failed && (
          <Alert className="mb-6 border-red-200 bg-red-50" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Eligibility Verification Failed</AlertTitle>
            <AlertDescription>
              We couldn't verify your eligibility. Please check your information or contact your local election office.
            </AlertDescription>
          </Alert>
        )}
        
        {!verificationComplete && !verifying && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="zipCode"
                    className="pl-8"
                    placeholder="Enter your ZIP code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    maxLength={5}
                  />
                </div>
                <p className="text-xs text-neutral-500">Your ZIP code helps verify your voting district</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <CalendarDays className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="dob"
                    className="pl-8"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                <p className="text-xs text-neutral-500">Must be 18 years or older to vote</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="voterID">Voter ID Number / Last 4 digits of SSN <span className="text-red-500">*</span></Label>
              <div className="relative">
                <UserCheck className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  id="voterID"
                  className="pl-8"
                  placeholder="Enter your Voter ID or last 4 digits of SSN"
                  value={voterIDNumber}
                  onChange={(e) => setVoterIDNumber(e.target.value)}
                />
              </div>
              <p className="text-xs text-neutral-500">Used to cross-reference your voter registration</p>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-md font-medium flex items-center">
                <Shield className="mr-2 h-4 w-4 text-primary" />
                Eligibility Criteria
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Are you a U.S. citizen? <span className="text-red-500">*</span></Label>
                  <RadioGroup value={citizenshipStatus} onValueChange={setCitizenshipStatus}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="citizen-yes" />
                      <Label htmlFor="citizen-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="citizen-no" />
                      <Label htmlFor="citizen-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="age" 
                    checked={ageConfirmation} 
                    onCheckedChange={checked => setAgeConfirmation(checked as boolean)}
                  />
                  <Label htmlFor="age" className="text-sm">
                    I confirm that I am 18 years of age or older <span className="text-red-500">*</span>
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label>How long have you been a resident at your current address? <span className="text-red-500">*</span></Label>
                  <Select value={residencyDuration} onValueChange={setResidencyDuration}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less-than-30">Less than 30 days</SelectItem>
                      <SelectItem value="30-days-to-6-months">30 days to 6 months</SelectItem>
                      <SelectItem value="6-months-to-1-year">6 months to 1 year</SelectItem>
                      <SelectItem value="more-than-1-year">More than 1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Felony Status <span className="text-red-500">*</span></Label>
                  <RadioGroup value={felonyStatus} onValueChange={setFelonyStatus}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="felony-none" />
                      <Label htmlFor="felony-none">No felony conviction</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="completed" id="felony-completed" />
                      <Label htmlFor="felony-completed">Completed sentence</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="current" id="felony-current" />
                      <Label htmlFor="felony-current">Currently serving sentence</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Do you have the mental capacity to vote? <span className="text-red-500">*</span></Label>
                  <RadioGroup value={mentalCapacity} onValueChange={setMentalCapacity}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="capacity-yes" />
                      <Label htmlFor="capacity-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="capacity-no" />
                      <Label htmlFor="capacity-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex flex-col space-y-3">
          {!verificationComplete ? (
            <Button
              onClick={handleVerify}
              disabled={verifying || !isFormValid()}
              className="w-full"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Eligibility...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Verify Eligibility
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
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://www.vote.org/am-i-registered-to-vote/', '_blank')}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Check Your Registration Status
          </Button>
        </div>
      </div>
    </div>
  );
}