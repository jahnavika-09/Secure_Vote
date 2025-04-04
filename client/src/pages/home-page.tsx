import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { List, ShieldCheck, Fingerprint, CheckCircle2, Vote } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Secure Automated Voting
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              A blockchain-based voting system with multi-factor authentication for maximum security and transparency.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/verification">
                <Button size="lg" className="mx-2">
                  <List className="mr-2 h-5 w-5" /> Start Verification
                </Button>
              </Link>
              {!user && (
                <Link href="/auth">
                  <Button variant="outline" size="lg" className="mx-2">
                    Login / Register
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary-light bg-opacity-10 flex items-center justify-center mb-2">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Identity Verification</CardTitle>
                  <CardDescription>
                    Verify your identity using government-issued ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Our system uses advanced security protocols to verify your identity against government records.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary-light bg-opacity-10 flex items-center justify-center mb-2">
                    <Fingerprint className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Biometric Authentication</CardTitle>
                  <CardDescription>
                    Confirm your identity with fingerprint or face ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Multi-factor authentication ensures that only you can cast your vote.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary-light bg-opacity-10 flex items-center justify-center mb-2">
                    <Vote className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Secure Voting</CardTitle>
                  <CardDescription>
                    Cast your vote securely and privately
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Your vote is encrypted and anonymized to ensure complete privacy while maintaining verifiability.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary-light bg-opacity-10 flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Blockchain Verification</CardTitle>
                  <CardDescription>
                    Immutable record of your vote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Blockchain technology ensures your vote is recorded accurately and cannot be tampered with.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-20 bg-primary bg-opacity-5 rounded-xl p-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:w-1/2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Ready to participate in the democratic process?
                </h2>
                <p className="mt-3 text-lg text-gray-500">
                  Our secure verification system makes voting more accessible while maintaining the highest security standards.
                </p>
              </div>
              <div className="mt-8 md:mt-0 md:w-1/2 md:flex md:justify-end">
                <Link href="/verification">
                  <Button size="lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
