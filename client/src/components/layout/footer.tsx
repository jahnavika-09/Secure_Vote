import React from "react";
import { HelpCircle, Shield, GavelIcon, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
        <p className="text-center text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} SecureVote. All rights reserved. Powered by blockchain technology.
        </p>
        <div className="mt-2 flex justify-center space-x-6">
          <a href="#" className="text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">Privacy Policy</span>
            <Shield className="h-4 w-4" />
          </a>
          <a href="#" className="text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">Terms</span>
            <GavelIcon className="h-4 w-4" />
          </a>
          <a href="#" className="text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">Security</span>
            <Lock className="h-4 w-4" />
          </a>
          <a href="#" className="text-neutral-400 hover:text-neutral-500">
            <span className="sr-only">Help</span>
            <HelpCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
