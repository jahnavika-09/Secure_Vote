import React from "react";
import { User, UserCircle } from "lucide-react";
import { VoterProfile } from "@shared/schema";

interface VoterInformationProps {
  voterProfile: VoterProfile;
}

export function VoterInformation({ voterProfile }: VoterInformationProps) {
  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <UserCircle className="mr-2 text-primary" />
          Voter Information
        </h2>

        <div className="border border-neutral-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
              <User className="text-neutral-500" size={32} />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-neutral-900">
                {voterProfile.userId}
              </h3>
              <p className="text-xs text-neutral-500">
                Voter ID: {voterProfile.voterId}
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">District</p>
                  <p className="text-sm text-neutral-900">{voterProfile.district}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Age</p>
                  <p className="text-sm text-neutral-900">{voterProfile.age}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Registration Date</p>
                  <p className="text-sm text-neutral-900">{voterProfile.registrationDate}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Voting Precinct</p>
                  <p className="text-sm text-neutral-900">{voterProfile.precinct}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
