import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Fingerprint, 
  Info, 
  ShieldCheck, 
  CheckCircle, 
  Camera, 
  Pin, 
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BiometricVerificationProps {
  onVerificationComplete: () => void;
}

export function BiometricVerification({ 
  onVerificationComplete 
}: BiometricVerificationProps) {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<'fingerprint' | 'face'>('fingerprint');
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleScanFingerprint = async () => {
    try {
      setIsScanning(true);
      
      // Simulate API call to verify biometric data
      const response = await apiRequest('POST', '/api/verification/biometric', {
        biometricType: 'fingerprint',
        biometricData: 'simulated-fingerprint-data-' + Date.now()
      });

      if (response.ok) {
        // Show success and set verified after a delay to simulate scanning
        setTimeout(() => {
          setIsVerified(true);
          toast({
            title: "Fingerprint verified",
            description: "Your fingerprint has been successfully verified.",
            variant: "success",
          });
          // Notify parent component that verification is complete
          onVerificationComplete();
        }, 2000);
      } else {
        throw new Error("Fingerprint verification failed");
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "There was a problem verifying your fingerprint. Please try again.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const handleScanFace = async () => {
    try {
      setIsScanning(true);
      
      // Simulate API call to verify biometric data
      const response = await apiRequest('POST', '/api/verification/biometric', {
        biometricType: 'face',
        biometricData: 'simulated-face-data-' + Date.now()
      });

      if (response.ok) {
        // Show success
        setTimeout(() => {
          setIsVerified(true);
          toast({
            title: "Face ID verified",
            description: "Your face has been successfully verified.",
            variant: "success",
          });
          onVerificationComplete();
        }, 2000);
      } else {
        throw new Error("Face verification failed");
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "There was a problem verifying your face. Please try again.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center">
          <Fingerprint className="mr-2 text-primary" />
          Biometric Authentication
        </h2>
        
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-6">
          <div className="text-sm text-neutral-600">
            <p className="mb-2 flex items-start">
              <Info className="mr-2 text-info h-4 w-4 mt-0.5" />
              Biometric authentication adds an extra layer of security to your voting verification.
            </p>
            <p className="mb-0 flex items-start">
              <ShieldCheck className="mr-2 text-info h-4 w-4 mt-0.5" />
              Your biometric data is encrypted and never stored in our system.
            </p>
          </div>
        </div>
        
        {/* Biometric Verification Options */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
          {/* Fingerprint Option */}
          <div 
            className={`border rounded-lg p-4 relative ${selectedMethod === 'fingerprint' 
              ? 'border-primary bg-primary bg-opacity-5' 
              : 'border-neutral-300'}`}
            onClick={() => setSelectedMethod('fingerprint')}
          >
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedMethod === 'fingerprint' ? 'bg-primary bg-opacity-10' : 'bg-neutral-100'
              }`}>
                <Fingerprint className={`${
                  selectedMethod === 'fingerprint' ? 'text-primary' : 'text-neutral-600'
                }`} />
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  selectedMethod === 'fingerprint' ? 'text-neutral-900' : 'text-neutral-600'
                }`}>
                  Fingerprint
                </h3>
                <p className="text-xs text-neutral-500">Quick & secure</p>
              </div>
            </div>
            
            {/* Fingerprint Scanner Simulation */}
            <div className="h-48 bg-neutral-800 rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Scanner line animation */}
              {isScanning && !isVerified && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500 animate-[scan_2s_infinite]"></div>
              )}
              
              <Fingerprint className="text-neutral-400" size={80} />
              
              {/* Success overlay */}
              {isVerified && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-green-500 rounded-full p-2">
                    <CheckCircle className="text-white" />
                  </div>
                </div>
              )}
            </div>
            
            <Button
              className="mt-4 w-full"
              disabled={isScanning || isVerified || selectedMethod !== 'fingerprint'}
              onClick={handleScanFingerprint}
            >
              {isScanning ? (
                <>
                  <div className="animate-spin mr-2">
                    <Fingerprint className="h-4 w-4" />
                  </div>
                  Scanning...
                </>
              ) : isVerified ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Fingerprint Verified
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Scan Fingerprint
                </>
              )}
            </Button>
          </div>
          
          {/* Face ID Option */}
          <div 
            className={`border rounded-lg p-4 relative ${selectedMethod === 'face' 
              ? 'border-primary bg-primary bg-opacity-5' 
              : 'border-neutral-300'}`}
            onClick={() => setSelectedMethod('face')}
          >
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedMethod === 'face' ? 'bg-primary bg-opacity-10' : 'bg-neutral-100'
              }`}>
                <Camera className={`${
                  selectedMethod === 'face' ? 'text-primary' : 'text-neutral-600'
                }`} />
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  selectedMethod === 'face' ? 'text-neutral-900' : 'text-neutral-600'
                }`}>
                  Face ID
                </h3>
                <p className="text-xs text-neutral-500">Contactless verification</p>
              </div>
            </div>
            
            <div className="h-48 bg-neutral-200 rounded-lg flex items-center justify-center">
              <Camera className="text-neutral-400" size={80} />
            </div>
            
            <Button
              className="mt-4 w-full"
              variant={selectedMethod === 'face' ? "default" : "outline"}
              disabled={isScanning || isVerified || selectedMethod !== 'face'}
              onClick={handleScanFace}
            >
              <Camera className="mr-2 h-4 w-4" />
              Scan Face
            </Button>
          </div>
        </div>
        
        {/* Alternative Options */}
        <div className="border-t border-neutral-200 pt-4">
          <h3 className="text-sm font-medium text-neutral-900 mb-3">Alternative Options</h3>
          <Button variant="outline" className="w-full mb-2">
            <Pin className="mr-2 h-4 w-4" />
            Use PIN Verification
          </Button>
          <Button variant="outline" className="w-full">
            <HelpCircle className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
