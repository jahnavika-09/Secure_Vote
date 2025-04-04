import React from "react";
import { VerificationSteps, VerificationStatus } from "@shared/schema";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  ShieldCheck,
  Fingerprint,
  MessageSquare,
  Link
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: keyof typeof VerificationStatus;
}

const StatusItem = ({ icon, title, description, status }: StatusItemProps) => {
  const statusConfig = {
    [VerificationStatus.PENDING]: {
      icon: <Clock className="text-neutral-400 text-sm" />,
      badgeClasses: "bg-neutral-200 text-neutral-500",
      label: "Pending"
    },
    [VerificationStatus.IN_PROGRESS]: {
      icon: <Clock className="text-warning text-sm" />,
      badgeClasses: "bg-warning bg-opacity-10 text-warning",
      label: "In Progress"
    },
    [VerificationStatus.VERIFIED]: {
      icon: <CheckCircle className="text-success text-sm" />,
      badgeClasses: "bg-success bg-opacity-10 text-success",
      label: "Verified"
    },
    [VerificationStatus.FAILED]: {
      icon: <AlertCircle className="text-error text-sm" />,
      badgeClasses: "bg-error bg-opacity-10 text-error",
      label: "Failed"
    }
  };

  const statusInfo = statusConfig[status];

  return (
    <div className="flex items-center">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center",
        status === VerificationStatus.VERIFIED 
          ? "bg-success bg-opacity-10" 
          : status === VerificationStatus.IN_PROGRESS 
            ? "bg-warning bg-opacity-10" 
            : status === VerificationStatus.FAILED 
              ? "bg-error bg-opacity-10" 
              : "bg-neutral-200"
      )}>
        {statusInfo.icon}
      </div>
      <div className="ml-3 flex-1">
        <div className="flex justify-between">
          <div>
            <h3 className={cn(
              "text-sm font-medium",
              status === VerificationStatus.PENDING ? "text-neutral-400" : "text-neutral-900"
            )}>
              {title}
            </h3>
            <p className={cn(
              "text-xs",
              status === VerificationStatus.PENDING ? "text-neutral-400" : "text-neutral-500"
            )}>
              {description}
            </p>
          </div>
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            statusInfo.badgeClasses
          )}>
            {statusInfo.label}
          </span>
        </div>
      </div>
    </div>
  );
};

interface VerificationStatusComponentProps {
  verificationStatus: Record<string, string>;
}

export function VerificationStatusComponent({ 
  verificationStatus 
}: VerificationStatusComponentProps) {
  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <CheckCircle className="mr-2 text-primary" />
          Verification Status
        </h2>

        <div className="space-y-4">
          {/* Identity Status */}
          <StatusItem
            icon={<User />}
            title="Identity Verification"
            description="ID Document Verification"
            status={(verificationStatus[VerificationSteps.IDENTITY] || VerificationStatus.PENDING) as any}
          />

          {/* Eligibility Status */}
          <StatusItem
            icon={<ShieldCheck />}
            title="Eligibility Check"
            description="Voter Registration Validation"
            status={(verificationStatus[VerificationSteps.ELIGIBILITY] || VerificationStatus.PENDING) as any}
          />

          {/* Biometric Status */}
          <StatusItem
            icon={<Fingerprint />}
            title="Biometric Authentication"
            description="Fingerprint or Face Verification"
            status={(verificationStatus[VerificationSteps.BIOMETRIC] || VerificationStatus.PENDING) as any}
          />

          {/* OTP Status */}
          <StatusItem
            icon={<MessageSquare />}
            title="OTP Verification"
            description="SMS Code Confirmation"
            status={(verificationStatus[VerificationSteps.OTP] || VerificationStatus.PENDING) as any}
          />

          {/* Blockchain Record */}
          <StatusItem
            icon={<Link />}
            title="Blockchain Record"
            description="Immutable Verification Log"
            status={(
              verificationStatus[VerificationSteps.READY] === VerificationStatus.VERIFIED 
                ? VerificationStatus.VERIFIED 
                : VerificationStatus.PENDING
            ) as any}
          />
        </div>

        {/* Transaction Security Info */}
        <div className="mt-5 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
          <div className="flex items-start">
            <ShieldCheck className="text-info mr-2 text-sm h-4 w-4 mt-0.5" />
            <div className="text-xs text-neutral-600">
              Your verification is secured with blockchain technology. Each step of verification is cryptographically logged for maximum security and transparency.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
