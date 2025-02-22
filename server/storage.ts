import { users, deputies, userVotes, type User, type InsertUser, type Deputy, type UserVote } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDeputies(): Promise<Deputy[]>;
  getUserVotes(userId: number): Promise<UserVote | undefined>;
  createUserVotes(userId: number): Promise<UserVote>;
  voteForDeputy(userId: number, deputyId: string): Promise<boolean>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private deputies: Map<string, Deputy>;
  private userVotes: Map<number, UserVote>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.deputies = new Map();
    this.userVotes = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.initializeDeputies();
  }

  private initializeDeputies() {
    const deputyData = [
      { id: "1", name: "Inese Kalnina", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "2", name: "Gundars Daudze", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "3", name: "Liga Klavina", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "4", name: "Agnese Krasta", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "5", name: "Natalja Marcenko-Jodko", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "6", name: "Juris Vilums", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "7", name: "Augusts Brigmanis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 }
    ];

    for (const deputy of deputyData) {
      this.deputies.set(deputy.id, deputy);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDeputies(): Promise<Deputy[]> {
    return Array.from(this.deputies.values());
  }

  async getUserVotes(userId: number): Promise<UserVote | undefined> {
    return this.userVotes.get(userId);
  }

  async createUserVotes(userId: number): Promise<UserVote> {
    const userVote: UserVote = {
      id: userId,
      userId,
      hasVoted: false,
      votedDeputies: [],
    };
    this.userVotes.set(userId, userVote);
    return userVote;
  }

  async voteForDeputy(userId: number, deputyId: string): Promise<boolean> {
    const userVote = await this.getUserVotes(userId);
    if (!userVote || userVote.votedDeputies.length >= 5) return false;

    const deputy = this.deputies.get(deputyId);
    if (!deputy) return false;

    deputy.votes++;
    userVote.votedDeputies.push(deputyId);
    if (userVote.votedDeputies.length === 5) {
      userVote.hasVoted = true;
    }

    this.deputies.set(deputyId, deputy);
    this.userVotes.set(userId, userVote);
    return true;
  }
}

export const storage = new MemStorage();