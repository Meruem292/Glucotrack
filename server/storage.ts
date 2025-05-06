import { 
  User, 
  Reading, 
  UserHealth, 
  InsertUser, 
  InsertReading, 
  InsertUserHealth 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Reading methods
  createReading(reading: InsertReading): Promise<Reading>;
  getReadingsByUserId(userId: number): Promise<Reading[]>;
  getLatestReadingByUserId(userId: number): Promise<Reading | undefined>;
  
  // User Health methods
  createUserHealth(userHealth: InsertUserHealth): Promise<UserHealth>;
  getUserHealthByUserId(userId: number): Promise<UserHealth | undefined>;
  updateUserHealth(userId: number, data: Partial<InsertUserHealth>): Promise<UserHealth | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private readings: Map<number, Reading>;
  private userHealth: Map<number, UserHealth>;
  private userId: number;
  private readingId: number;
  private userHealthId: number;

  constructor() {
    this.users = new Map();
    this.readings = new Map();
    this.userHealth = new Map();
    this.userId = 1;
    this.readingId = 1;
    this.userHealthId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseId === firebaseId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Reading methods
  async createReading(insertReading: InsertReading): Promise<Reading> {
    const id = this.readingId++;
    const createdAt = new Date();
    const reading: Reading = { ...insertReading, id, createdAt };
    this.readings.set(id, reading);
    return reading;
  }

  async getReadingsByUserId(userId: number): Promise<Reading[]> {
    return Array.from(this.readings.values())
      .filter(reading => reading.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLatestReadingByUserId(userId: number): Promise<Reading | undefined> {
    const userReadings = await this.getReadingsByUserId(userId);
    return userReadings.length > 0 ? userReadings[0] : undefined;
  }

  // User Health methods
  async createUserHealth(insertUserHealth: InsertUserHealth): Promise<UserHealth> {
    const id = this.userHealthId++;
    const userHealth: UserHealth = { ...insertUserHealth, id };
    this.userHealth.set(id, userHealth);
    return userHealth;
  }

  async getUserHealthByUserId(userId: number): Promise<UserHealth | undefined> {
    return Array.from(this.userHealth.values()).find(
      health => health.userId === userId
    );
  }

  async updateUserHealth(userId: number, data: Partial<InsertUserHealth>): Promise<UserHealth | undefined> {
    const existingHealth = await this.getUserHealthByUserId(userId);
    
    if (!existingHealth) {
      return undefined;
    }
    
    const updatedHealth: UserHealth = {
      ...existingHealth,
      ...data
    };
    
    this.userHealth.set(existingHealth.id, updatedHealth);
    return updatedHealth;
  }
}

export const storage = new MemStorage();
