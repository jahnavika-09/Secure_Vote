import React from "react";
import { Button } from "@/components/ui/button";
import { 
  VideoIcon, 
  HelpCircle, 
  PhoneCall, 
  AlertTriangle 
} from "lucide-react";

export function HelpCard() {
  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Need Help?</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button variant="outline" className="flex items-center justify-center">
            <VideoIcon className="mr-2 text-neutral-500 h-4 w-4" />
            Video Tutorial
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <HelpCircle className="mr-2 text-neutral-500 h-4 w-4" />
            FAQs
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <PhoneCall className="mr-2 text-neutral-500 h-4 w-4" />
            Live Support
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <AlertTriangle className="mr-2 text-neutral-500 h-4 w-4" />
            Report Issue
          </Button>
        </div>
      </div>
    </div>
  );
}
