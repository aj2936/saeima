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
      { id: "16", name: "Dāvis Mārtiņš Daugavietis", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "17", name: "Jānis Dombrava", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "18", name: "Jekaterina Drelinga", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "19", name: "Raivis Dzintars", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "20", name: "Mārtiņš Felss", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "21", name: "Alīna Gendele", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "22", name: "Ligita Gintere", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "23", name: "Jānis Grasbergs", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "24", name: "Ilze Indriksone", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "25", name: "Iļja Ivanovs", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "26", name: "Juris Jakovins", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "27", name: "Mārcis Jencītis", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "28", name: "Andrejs Judins", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "29", name: "Igors Judins", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "30", name: "Edmunds Jurēvics", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "31", name: "Zanda Kalniņa-Lukaševica", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "32", name: "Inese Kalniņa", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "33", name: "Irma Kalniņa", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "34", name: "Aleksandrs Kiršteins", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "35", name: "Jefimijs Klementjevs", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "36", name: "Jurģis Klotiņš", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "37", name: "Līga Kļaviņa", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "38", name: "Dmitrijs Kovaļenko", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "39", name: "Līga Kozlovska", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "40", name: "Agnese Krasta", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "41", name: "Ģirts Valdis Kristovskis", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "42", name: "Kristaps Krištopans", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "43", name: "Māris Kučinskis", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "44", name: "Andris Kulbergs", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "45", name: "Gunārs Kūtris", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "46", name: "Ervins Labanovskis", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "47", name: "Atis Labucis", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "48", name: "Ainars Latkovskis", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "49", name: "Ingmārs Līdaka", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "50", name: "Linda Liepiņa", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "51", name: "Gatis Liepiņš", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "52", name: "Lauris Lizbovskis", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "53", name: "Mairita Lūse", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "54", name: "Nataļja Marčenko-Jodko", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "55", name: "Valdis Maslovskis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "56", name: "Linda Matisone", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "57", name: "Daiga Mieriņa", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "58", name: "Uģis Mitrevics", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "59", name: "Ināra Mūrniece", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "60", name: "Antoņina Ņenaševa", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "61", name: "Jānis Patmalnieks", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "62", name: "Ramona Petraviča", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "63", name: "Viktorija Pleškāne", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "64", name: "Viktors Pučka", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "65", name: "Nauris Puntulis", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "66", name: "Edgars Putra", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "67", name: "Igors Rajevs", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "68", name: "Anna Rancāne", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "69", name: "Leila Rasima", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "70", name: "Jānis Reirs", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "71", name: "Harijs Rokpelnis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "72", name: "Aleksejs Rosļikovs", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "73", name: "Uģis Rotbergs", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "74", name: "Amils Saļimovs", faction: "Frakcija \"Stabilitātei!\"", votes: 0 },
      { id: "75", name: "Jana Simanovska", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "76", name: "Jānis Skrastiņš", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "77", name: "Zane Skujiņa-Rubene", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "78", name: "Edvards Smiltēns", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "79", name: "Māris Sprindžuks", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "80", name: "Ilze Stobova", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "81", name: "Ainārs Šlesers", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "82", name: "Ričards Šlesers", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 },
      { id: "83", name: "Didzis Šmits", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "84", name: "Edvīns Šnore", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "85", name: "Ģirts Štekerhofs", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "86", name: "Andris Šuvajevs", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "87", name: "Atis Švinka", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "88", name: "Edgars Tavars", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "89", name: "Edmunds Teirumnieks", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "90", name: "Ilze Vergina", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "91", name: "Aiva Vīksna", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "92", name: "Andrejs Vilks", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "93", name: "Juris Viļums", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "94", name: "Jānis Vitenbergs", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "95", name: "Jānis Vucāns", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "96", name: "Agita Zariņa-Stūre", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "97", name: "Viesturs Zariņš", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "98", name: "Edgars Zelderis", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "99", name: "Didzis Zemmers", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "100", name: "Edmunds Zivtiņš", faction: "Frakcija LATVIJA PIRMAJĀ VIETĀ", votes: 0 }
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