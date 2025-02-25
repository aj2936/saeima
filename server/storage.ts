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
  private currentId: number;
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

  async getUser(id: number): Promise<User | undefined> {
    try {
      return this.users.get(id);
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return Array.from(this.users.values()).find(
        (user) => user.username.toLowerCase() === username.toLowerCase(),
      );
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const existingUser = await this.getUserByUsername(insertUser.username);
      if (existingUser) {
        throw new Error("Lietotājvārds jau eksistē");
      }

      const id = this.currentId++;
      const user: User = { ...insertUser, id };
      this.users.set(id, user);
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  private initializeDeputies() {
    const deputyData = [
      { id: "1", name: "Skaidrīte Ābrama", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "2", name: "Česlavs Batņa", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "3", name: "Raimonds Bergmanis", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "4", name: "Andris Bērziņš", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "5", name: "Anita Brakovska", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "6", name: "Augusts Brigmanis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "7", name: "Oļegs Burovs", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "8", name: "Artūrs Butāns", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "9", name: "Andrejs Ceļapīters", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "10", name: "Edmunds Cepurītis", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "11", name: "Ingrīda Circene", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "12", name: "Raimonds Čudars", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "13", name: "Svetlana Čulkova", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "14", name: "Mārtiņš Daģis", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "15", name: "Gundars Daudze", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "16", name: "Anda Čakša", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "17", name: "Arvils Ašeradens", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "18", name: "Andris Kulbergs", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "19", name: "Vita Anda Tērauda", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "20", name: "Edmunds Teirumnieks", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "21", name: "Krišjānis Feldmans", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "22", name: "Mārtiņš Felss", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "23", name: "Ainārs Šlesers", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "24", name: "Linda Medne", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "25", name: "Ingmārs Līdaka", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "26", name: "Māris Kučinskis", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "27", name: "Atis Švinka", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "28", name: "Jānis Vitenbergs", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "29", name: "Dana Reizniece-Ozola", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "30", name: "Viktors Valainis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "31", name: "Edvards Smiltēns", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "32", name: "Andris Skride", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "33", name: "Evika Siliņa", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "34", name: "Aleksandrs Kiršteins", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "35", name: "Edgars Tavars", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "36", name: "Reinis Uzulnieks", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "37", name: "Hardijs Vents", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "38", name: "Andris Sprūds", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "39", name: "Agnese Krasta", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "40", name: "Māris Mičerevskis", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "41", name: "Zanda Kalniņa-Lukaševica", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "42", name: "Ainars Latkovskis", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "43", name: "Andris Bite", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "44", name: "Jānis Cielēns", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "45", name: "Roberts Spručs", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "46", name: "Ričards Ansikts", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "47", name: "Igors Rajevs", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "48", name: "Glorija Grevcova", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "49", name: "Nikolajs Ratkevičs", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "50", name: "Ramona Petraviča", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "51", name: "Linda Matisone", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "52", name: "Māris Možvillo", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "53", name: "Jūlija Stepaņenko", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "54", name: "Aldis Gobzems", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "55", name: "Līga Krapāne", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "56", name: "Gunārs Kūtris", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "57", name: "Viktorija Baire", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "58", name: "Andris Kazinovskis", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "59", name: "Edvards Ratnieks", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "60", name: "Uģis Mitrevics", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "61", name: "Edmunds Jurēvics", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "62", name: "Ilze Indriksone", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "63", name: "Raivis Dzintars", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "64", name: "Jānis Dombrava", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "65", name: "Juris Viļums", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "66", name: "Kaspars Briškens", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "67", name: "Andris Šuvajevs", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "68", name: "Arvīds Platpers", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "69", name: "Jānis Urbanovičs", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "70", name: "Raimonds Rubiks", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "71", name: "Marija Nikiforovska", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "72", name: "Valērijs Agešins", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "73", name: "Regīna Ločmele-Luņova", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "74", name: "Viktors Pučka", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "75", name: "Alexey Roslyakov", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "76", name: "Vjačeslavs Stepanenko", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "77", name: "Romāns Naudiņš", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "78", name: "Ainars Bašķis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "79", name: "Armands Krauze", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "80", name: "Gundars Ruža", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "81", name: "Aivars Endziņš", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "82", name: "Līga Kozlovska", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "83", name: "Edgars Kronbergs", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "84", name: "Uģis Rotbergs", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "85", name: "Aigars Bikše", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "86", name: "Hosams Abu Meri", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "87", name: "Artūrs Toms Plešs", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "88", name: "Juris Pūce", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "89", name: "Juris Rancāns", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "90", name: "Zane Skujiņa", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "91", name: "Jānis Skrastiņš", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "92", name: "Ainārs Šteins", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "93", name: "Sandis Riekstiņš", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "94", name: "Ainars Baštiks", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "95", name: "Ieva Krapāne", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "96", name: "Ralfs Nemiro", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "97", name: "Gunārs Sergejevs", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "98", name: "Nellija Kleinberga", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "99", name: "Didzis Zemmers", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "100", name: "Edmunds Zivtiņš", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 }
    ];

    for (const deputy of deputyData) {
      this.deputies.set(deputy.id, deputy);
    }
  }

  async getDeputies(): Promise<Deputy[]> {
    return Array.from(this.deputies.values()).sort((a, b) => b.votes - a.votes);
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