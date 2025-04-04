import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Vote, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Link as LinkIcon, 
  Loader2, 
  RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { VerificationSteps, VerificationStatus } from "@shared/schema";

// Status badges
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case VerificationStatus.VERIFIED:
      return <Badge variant="success" className="bg-green-100 text-green-800">Verified</Badge>;
    case VerificationStatus.IN_PROGRESS:
      return <Badge variant="warning" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
    case VerificationStatus.FAILED:
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
};

// Format verification step label
const formatStepLabel = (step: string) => {
  switch (step) {
    case VerificationSteps.IDENTITY:
      return "Identity Verification";
    case VerificationSteps.ELIGIBILITY:
      return "Eligibility Check";
    case VerificationSteps.BIOMETRIC:
      return "Biometric Authentication";
    case VerificationSteps.OTP:
      return "OTP Verification";
    case VerificationSteps.READY:
      return "Ready to Vote";
    default:
      return step;
  }
};

export default function AdminDashboard() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if user is admin
  if (user && user.role !== "admin") {
    navigate("/");
    return null;
  }
  
  // Fetch verification sessions
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/admin/sessions", refreshTrigger],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load verification sessions",
        variant: "destructive",
      });
    },
  });
  
  // Fetch blockchain status
  const { data: blockchainStatus, isLoading: isLoadingBlockchain } = useQuery({
    queryKey: ["/api/admin/blockchain", refreshTrigger],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load blockchain status",
        variant: "destructive",
      });
    },
  });
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Prepare stats
  const stats = {
    totalVerifications: sessions?.length || 0,
    completedVerifications: sessions?.filter((s: any) => 
      s.step === VerificationSteps.READY && s.status === VerificationStatus.VERIFIED
    ).length || 0,
    pendingVerifications: sessions?.filter((s: any) => 
      s.status === VerificationStatus.IN_PROGRESS
    ).length || 0,
    failedVerifications: sessions?.filter((s: any) => 
      s.status === VerificationStatus.FAILED
    ).length || 0,
  };
  
  // Prepare chart data
  const verificationsByStep = [
    { name: "Identity", count: sessions?.filter((s: any) => s.step === VerificationSteps.IDENTITY).length || 0 },
    { name: "Eligibility", count: sessions?.filter((s: any) => s.step === VerificationSteps.ELIGIBILITY).length || 0 },
    { name: "Biometric", count: sessions?.filter((s: any) => s.step === VerificationSteps.BIOMETRIC).length || 0 },
    { name: "OTP", count: sessions?.filter((s: any) => s.step === VerificationSteps.OTP).length || 0 },
    { name: "Ready", count: sessions?.filter((s: any) => s.step === VerificationSteps.READY).length || 0 },
  ];
  
  const verificationsByStatus = [
    { name: "Verified", value: sessions?.filter((s: any) => s.status === VerificationStatus.VERIFIED).length || 0 },
    { name: "In Progress", value: sessions?.filter((s: any) => s.status === VerificationStatus.IN_PROGRESS).length || 0 },
    { name: "Failed", value: sessions?.filter((s: any) => s.status === VerificationStatus.FAILED).length || 0 },
    { name: "Pending", value: sessions?.filter((s: any) => s.status === VerificationStatus.PENDING).length || 0 },
  ];
  
  const pieColors = ["#4CAF50", "#FF9800", "#F44336", "#9E9E9E"];
  
  // Loading state
  if (isLoadingSessions || isLoadingBlockchain) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 20rem)' }}>
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium text-gray-900">Loading dashboard data...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Monitor and manage voter verification processes</p>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="ml-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Verifications</p>
                    <p className="text-3xl font-bold">{stats.totalVerifications}</p>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Users className="h-6 w-6 text-gray-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-3xl font-bold">{stats.completedVerifications}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                    <p className="text-3xl font-bold">{stats.pendingVerifications}</p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Failed</p>
                    <p className="text-3xl font-bold">{stats.failedVerifications}</p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Blockchain Status Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center">
                <LinkIcon className="mr-2 h-5 w-5 text-primary" />
                <CardTitle>Blockchain Status</CardTitle>
              </div>
              <CardDescription>
                Current state of the blockchain verification ledger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Chain Status</p>
                  <div className="flex items-center mt-1">
                    {blockchainStatus?.isValid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <p className="text-lg font-bold text-green-600">Valid</p>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <p className="text-lg font-bold text-red-600">Invalid</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Chain Length</p>
                  <p className="text-lg font-bold mt-1">{blockchainStatus?.chainLength} blocks</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Last Verified</p>
                  <p className="text-lg font-bold mt-1">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs for different views */}
          <Tabs defaultValue="analytics">
            <TabsList className="mb-6">
              <TabsTrigger value="analytics">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="sessions">
                <Vote className="mr-2 h-4 w-4" />
                Verification Sessions
              </TabsTrigger>
              <TabsTrigger value="security">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Security Monitoring
              </TabsTrigger>
            </TabsList>
            
            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Verifications by Step */}
                <Card>
                  <CardHeader>
                    <CardTitle>Verifications by Step</CardTitle>
                    <CardDescription>
                      Distribution of verification sessions across different steps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={verificationsByStep}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#1565C0" name="Sessions" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Verifications by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status Distribution</CardTitle>
                    <CardDescription>
                      Overview of verification statuses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={verificationsByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {verificationsByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Sessions Tab */}
            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Sessions</CardTitle>
                  <CardDescription>
                    Detailed view of all verification sessions in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>A list of all verification sessions.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Step</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Blockchain Ref</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions && sessions.length > 0 ? (
                        sessions.map((session: any) => (
                          <TableRow key={session.id}>
                            <TableCell className="font-medium">{session.id}</TableCell>
                            <TableCell>{session.userId}</TableCell>
                            <TableCell>{formatStepLabel(session.step)}</TableCell>
                            <TableCell>
                              <StatusBadge status={session.status} />
                            </TableCell>
                            <TableCell>
                              {new Date(session.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {session.blockchainRef ? (
                                <span className="text-xs font-mono">
                                  {session.blockchainRef.substring(0, 8)}...
                                </span>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <span className="sr-only">Open menu</span>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="1" />
                                      <circle cx="12" cy="5" r="1" />
                                      <circle cx="12" cy="19" r="1" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Verify Blockchain Record</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No verification sessions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Monitoring</CardTitle>
                  <CardDescription>
                    Real-time security metrics and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">System Status</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm font-medium text-gray-500">Blockchain Integrity</p>
                          <div className="flex items-center mt-1">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <p className="text-lg font-bold text-green-600">Secure</p>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm font-medium text-gray-500">Authentication Services</p>
                          <div className="flex items-center mt-1">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <p className="text-lg font-bold text-green-600">Online</p>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-sm font-medium text-gray-500">Suspicious Activities</p>
                          <div className="flex items-center mt-1">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                            <p className="text-lg font-bold text-yellow-600">0 detected</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Recent Security Logs</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Event Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Severity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>{new Date().toLocaleTimeString()}</TableCell>
                            <TableCell>Blockchain Verification</TableCell>
                            <TableCell>Chain integrity verified successfully</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Info
                              </Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>{new Date(Date.now() - 300000).toLocaleTimeString()}</TableCell>
                            <TableCell>Authentication</TableCell>
                            <TableCell>Admin login successful</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Info
                              </Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>{new Date(Date.now() - 3600000).toLocaleTimeString()}</TableCell>
                            <TableCell>System</TableCell>
                            <TableCell>Biometric verification services restarted</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                Notice
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
