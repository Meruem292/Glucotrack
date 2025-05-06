import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertReadingSchema, insertUserSchema, insertUserHealthSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User endpoints
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/firebase/:firebaseId", async (req, res) => {
    try {
      const firebaseId = req.params.firebaseId;
      const user = await storage.getUserByFirebaseId(firebaseId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reading endpoints
  app.post("/api/readings", async (req, res) => {
    try {
      const validatedData = insertReadingSchema.parse(req.body);
      const reading = await storage.createReading(validatedData);
      res.status(201).json(reading);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/readings/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const readings = await storage.getReadingsByUserId(userId);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/readings/latest/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const reading = await storage.getLatestReadingByUserId(userId);
      
      if (!reading) {
        return res.status(404).json({ message: "No readings found for this user" });
      }
      
      res.json(reading);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Health endpoints
  app.post("/api/user-health", async (req, res) => {
    try {
      const validatedData = insertUserHealthSchema.parse(req.body);
      const userHealth = await storage.createUserHealth(validatedData);
      res.status(201).json(userHealth);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/user-health/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userHealth = await storage.getUserHealthByUserId(userId);
      
      if (!userHealth) {
        return res.status(404).json({ message: "User health data not found" });
      }
      
      res.json(userHealth);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/user-health/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const validatedData = insertUserHealthSchema.omit({ userId: true }).parse(req.body);
      const userHealth = await storage.updateUserHealth(userId, validatedData);
      
      if (!userHealth) {
        return res.status(404).json({ message: "User health data not found" });
      }
      
      res.json(userHealth);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
