import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { initializeBlockchain, Blockchain } from "./blockchain";
import { 
  VerificationSteps, 
  VerificationStatus, 
  insertVerificationSessionSchema 
} from "@shared/schema";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Initialize the blockchain
  await initializeBlockchain();

  // Voter Profile API
  app.get("/api/voter-profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const profile = await storage.getVoterProfileByUserId(req.user!.id);
      if (!profile) {
        return res.status(404).json({ message: "Voter profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/voter-profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Check if profile already exists
      const existingProfile = await storage.getVoterProfileByUserId(req.user!.id);
      if (existingProfile) {
        return res.status(400).json({ message: "Voter profile already exists" });
      }

      const profile = await storage.createVoterProfile({
        ...req.body,
        userId: req.user!.id
      });
      
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Verification Session API
  app.get("/api/verification", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const sessions = await storage.getVerificationSessionsByUserId(req.user!.id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/verification/start", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Check if voter profile exists
      const voterProfile = await storage.getVoterProfileByUserId(req.user!.id);
      if (!voterProfile) {
        return res.status(400).json({ message: "Voter profile required" });
      }
      
      // Ensure user is eligible to vote
      if (!voterProfile.isEligible) {
        return res.status(403).json({ message: "Voter is not eligible" });
      }
      
      // Record this verification session to the blockchain
      const blockchain = await Blockchain.getInstance();
      const block = await blockchain.addBlock({
        type: "verification_start",
        userId: req.user!.id,
        voterId: voterProfile.voterId,
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      // Create the initial verification session (Identity verification)
      const identitySession = await storage.createVerificationSession({
        userId: req.user!.id,
        step: VerificationSteps.IDENTITY,
        status: VerificationStatus.IN_PROGRESS,
        blockchainRef: block.hash
      });
      
      res.status(201).json(identitySession);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/verification/step/:step", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { step } = req.params;
    const uppercaseStep = step.toUpperCase();
    
    // Validate step parameter
    if (!Object.values(VerificationSteps).includes(uppercaseStep as any)) {
      return res.status(400).json({ message: "Invalid verification step" });
    }
    
    try {
      // Get user's verification sessions
      const sessions = await storage.getVerificationSessionsByUserId(req.user!.id);
      
      // Get latest session
      const latestSession = sessions[0];
      
      if (!latestSession) {
        return res.status(400).json({ 
          message: "No active verification session. Please start the verification process first." 
        });
      }
      
      // Validate step sequence
      const currentStepIndex = Object.values(VerificationSteps).indexOf(latestSession.step as any);
      const requestedStepIndex = Object.values(VerificationSteps).indexOf(uppercaseStep as any);
      
      if (requestedStepIndex !== currentStepIndex + 1) {
        return res.status(400).json({ 
          message: "Invalid verification sequence. Please complete the previous steps first." 
        });
      }
      
      // Mark the current step as verified
      await storage.updateVerificationSession(latestSession.id, {
        status: VerificationStatus.VERIFIED
      });
      
      // Record verification step in blockchain
      const blockchain = await Blockchain.getInstance();
      const block = await blockchain.addBlock({
        type: "verification_step",
        userId: req.user!.id,
        step: latestSession.step,
        status: VerificationStatus.VERIFIED,
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      // Create the next verification step
      const newSession = await storage.createVerificationSession({
        userId: req.user!.id,
        step: uppercaseStep,
        status: VerificationStatus.IN_PROGRESS,
        blockchainRef: block.hash
      });
      
      res.status(201).json(newSession);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/verification/biometric", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // This would normally verify actual biometric data
      // For demo purposes, we'll simulate verification with a simple check
      
      const { biometricType, biometricData } = req.body;
      
      if (!biometricType || !biometricData) {
        return res.status(400).json({ 
          message: "Biometric type and data are required" 
        });
      }
      
      // Get latest verification session
      const sessions = await storage.getVerificationSessionsByUserId(req.user!.id);
      const latestSession = sessions[0];
      
      if (!latestSession || latestSession.step !== VerificationSteps.BIOMETRIC) {
        return res.status(400).json({ 
          message: "Invalid verification step. You must be in the biometric verification step." 
        });
      }
      
      // Simulate biometric matching - in a real system this would
      // use actual biometric matching algorithms
      const isMatch = biometricData.length > 10; // Arbitrary validation
      
      if (!isMatch) {
        return res.status(400).json({ message: "Biometric verification failed" });
      }
      
      // Record biometric verification in blockchain
      const blockchain = await Blockchain.getInstance();
      await blockchain.addBlock({
        type: "biometric_verification",
        userId: req.user!.id,
        biometricType,
        verified: true,
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      res.json({ success: true, message: "Biometric verification successful" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/verification/otp/generate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Get user's verification sessions
      const sessions = await storage.getVerificationSessionsByUserId(req.user!.id);
      const latestSession = sessions[0];
      
      if (!latestSession || latestSession.step !== VerificationSteps.OTP) {
        return res.status(400).json({ 
          message: "Invalid verification step. You must be in the OTP verification step." 
        });
      }
      
      // Generate a 6-digit OTP
      const otp = randomBytes(3).readUIntBE(0, 3) % 1000000;
      const formattedOtp = otp.toString().padStart(6, '0');
      
      // In a real application, we would send this OTP via SMS/email
      // For this demo, we'll just return it directly
      
      // Record OTP generation in blockchain
      const blockchain = await Blockchain.getInstance();
      await blockchain.addBlock({
        type: "otp_generation",
        userId: req.user!.id,
        otpHash: Buffer.from(formattedOtp).toString('base64'), // Don't store actual OTP
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      res.json({ 
        success: true, 
        message: "OTP generated successfully", 
        otp: formattedOtp 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/verification/otp/verify", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { otp } = req.body;
      
      if (!otp) {
        return res.status(400).json({ message: "OTP is required" });
      }
      
      // Get latest verification session
      const sessions = await storage.getVerificationSessionsByUserId(req.user!.id);
      const latestSession = sessions[0];
      
      if (!latestSession || latestSession.step !== VerificationSteps.OTP) {
        return res.status(400).json({ 
          message: "Invalid verification step. You must be in the OTP verification step." 
        });
      }
      
      // For demo purposes, we'll accept any 6-digit OTP
      // In a real application, we would validate against the actual OTP
      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: "Invalid OTP format" });
      }
      
      // Record OTP verification in blockchain
      const blockchain = await Blockchain.getInstance();
      const block = await blockchain.addBlock({
        type: "otp_verification",
        userId: req.user!.id,
        verified: true,
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      // Mark OTP verification as complete
      await storage.updateVerificationSession(latestSession.id, {
        status: VerificationStatus.VERIFIED
      });
      
      res.json({ 
        success: true, 
        message: "OTP verification successful"
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Handle the ready step (final step)
  app.post("/api/verification/step/ready", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Get latest verification session
      const sessions = await storage.getVerificationSessionsByUserId(req.user!.id);
      const latestSession = sessions[0];
      
      if (!latestSession || latestSession.step !== VerificationSteps.OTP) {
        return res.status(400).json({ 
          message: "Invalid verification step. You must complete the OTP verification first." 
        });
      }
      
      if (latestSession.status !== VerificationStatus.VERIFIED) {
        return res.status(400).json({
          message: "Please verify your OTP first."
        });
      }
      
      // Record final verification in blockchain
      const blockchain = await Blockchain.getInstance();
      const block = await blockchain.addBlock({
        type: "final_verification",
        userId: req.user!.id,
        verified: true,
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      // Create the final "Ready to Vote" step, but set it to IN_PROGRESS initially
      // so the user still has to manually complete it
      const finalSession = await storage.createVerificationSession({
        userId: req.user!.id,
        step: VerificationSteps.READY,
        status: VerificationStatus.IN_PROGRESS,
        blockchainRef: block.hash
      });
      
      res.status(201).json(finalSession);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Complete the final verification step
  app.post("/api/verification/ready/complete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Get latest verification session
      const sessions = await storage.getVerificationSessionsByUserId(req.user!.id);
      const latestSession = sessions[0];
      
      if (!latestSession || latestSession.step !== VerificationSteps.READY) {
        return res.status(400).json({ 
          message: "Invalid verification step. You must reach the ready step first." 
        });
      }
      
      if (latestSession.status !== VerificationStatus.IN_PROGRESS) {
        return res.status(400).json({
          message: "Ready step is not in progress."
        });
      }
      
      // Update the session to mark it as verified
      await storage.updateVerificationSession(latestSession.id, {
        status: VerificationStatus.VERIFIED
      });
      
      // Record in blockchain
      const blockchain = await Blockchain.getInstance();
      await blockchain.addBlock({
        type: "verification_complete",
        userId: req.user!.id,
        verified: true,
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      res.json({ 
        success: true, 
        message: "Verification process completed successfully." 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Special endpoint to fix verification sequence for biometric authentication
  app.post("/api/verification/fix-sequence", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Get user's verification sessions
      const sessions = await storage.getVerificationSessionsByUserId(req.user!.id);
      
      if (sessions.length === 0) {
        return res.status(400).json({
          message: "No verification sessions found."
        });
      }
      
      // Get the latest session
      const latestSession = sessions[0];
      
      // Create the appropriate next step based on the current step
      let nextStep;
      let currentStep = latestSession.step;
      
      switch (currentStep) {
        case VerificationSteps.IDENTITY:
          nextStep = VerificationSteps.ELIGIBILITY;
          break;
        case VerificationSteps.ELIGIBILITY:
          nextStep = VerificationSteps.BIOMETRIC;
          break;
        case VerificationSteps.BIOMETRIC:
          nextStep = VerificationSteps.OTP;
          break;
        case VerificationSteps.OTP:
          nextStep = VerificationSteps.READY;
          break;
        default:
          return res.status(400).json({
            message: "Cannot determine next step in sequence."
          });
      }
      
      // Mark the current step as verified
      await storage.updateVerificationSession(latestSession.id, {
        status: VerificationStatus.VERIFIED
      });
      
      // Record verification step in blockchain
      const blockchain = await Blockchain.getInstance();
      const block = await blockchain.addBlock({
        type: "verification_step",
        userId: req.user!.id,
        step: latestSession.step,
        status: VerificationStatus.VERIFIED,
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      // Create the next step in sequence
      const newSession = await storage.createVerificationSession({
        userId: req.user!.id,
        step: nextStep,
        status: VerificationStatus.IN_PROGRESS,
        blockchainRef: block.hash
      });
      
      res.status(201).json({
        success: true,
        message: `Successfully advanced from ${currentStep} to ${nextStep}`,
        session: newSession
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin endpoints for monitoring
  app.get("/api/admin/sessions", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      // In a real app, this would be paginated and have more filters
      // This is simplified for the demo
      
      // Get all verification sessions from all users
      // This would typically use a dedicated query that fetches all sessions
      // For now, we'll just return the most recent 100 sessions
      const allSessions = await storage.getAllVerificationSessions(100);
      
      res.json(allSessions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/blockchain", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const blockchain = await Blockchain.getInstance();
      const isValid = await blockchain.isChainValid();
      const chainLength = await blockchain.getChainLength();
      
      res.json({
        isValid,
        chainLength,
        message: isValid ? "Blockchain is valid" : "Blockchain validation failed"
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
