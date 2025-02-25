
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
      { id: "11", name: "Anda Čakša", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "12", name: "Gundars Daudze", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "13", name: "Jānis Dombrava", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "14", name: "Sergejs Dolgopolovs", faction: "Saskaņas Sociāldemokrātiskā partija", votes: 0 },
      { id: "15", name: "Vjačeslavs Dombrovskis", faction: "Saskaņas Sociāldemokrātiskā partija", votes: 0 },
      { id: "16", name: "Uldis Budriķis", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "17", name: "Reinis Znotiņš", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "18", name: "Vita Anda Tērauda", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "19", name: "Jānis Vitenbergs", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "20", name: "Aigars Štokenbergs", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "21", name: "Inga Bērziņa", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "22", name: "Jānis Butāns", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "23", name: "Andris Kulbergs", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "24", name: "Arvils Ašeradens", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "25", name: "Raimonds Čudars", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "26", name: "Atis Švinka", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "27", name: "Ainars Bašķis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "28", name: "Dagmāra Beitnere-Le Galla", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "29", name: "Ingmārs Līdaka", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "30", name: "Māris Kučinskis", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "31", name: "Ainars Latkovskis", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "32", name: "Viktors Valainis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "33", name: "Krišjānis Feldmans", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "34", name: "Andris Sprūds", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "35", name: "Mārtiņš Šteins", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "36", name: "Edvards Smiltēns", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "37", name: "Linda Medne", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "38", name: "Jānis Reirs", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "39", name: "Gatis Eglītis", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "40", name: "Māris Mičerevskis", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "41", name: "Dace Rukšāne-Ščipčinska", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "42", name: "Arvīds Platpers", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "43", name: "Edgars Tavars", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "44", name: "Uldis Augulis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "45", name: "Dainis Turlais", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "46", name: "Andris Bite", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "47", name: "Rihards Kozlovskis", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "48", name: "Edmunds Teirumnieks", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "49", name: "Ainārs Šlesers", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "50", name: "Ralfs Nemiro", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "51", name: "Māris Sprindžuks", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "52", name: "Evika Siliņa", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "53", name: "Uģis Rotbergs", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "54", name: "Ainars Mežulis", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "55", name: "Kaspars Melnis", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "56", name: "Haralds Augulis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "57", name: "Janīna Kursīte-Pakule", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "58", name: "Uldis Pīlēns", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "59", name: "Jānis Patmalnieks", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "60", name: "Dana Reizniece-Ozola", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "61", name: "Atis Zakatistovs", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "62", name: "Juris Rancāns", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "63", name: "Aleksandrs Kiršteins", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "64", name: "Igors Rajevs", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "65", name: "Kaspars Ģirģens", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "66", name: "Jānis Cielēns", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "67", name: "Andris Skride", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "68", name: "Edmunds Jurēvics", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "69", name: "Jānis Klovāns", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "70", name: "Roberts Mednis", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "71", name: "Romāns Naudiņš", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "72", name: "Viktors Ščerbatihs", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "73", name: "Aiva Vīksna", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "74", name: "Sandis Riekstiņš", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "75", name: "Uldis Liepiņš", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "76", name: "Viktorija Baire", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "77", name: "Zane Skujiņa", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "78", name: "Agnese Krasta", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "79", name: "Līga Kozlovska", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "80", name: "Edmunds Zivtiņš", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "81", name: "Anda Poikāne", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "82", name: "Gundars Grasbergs", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "83", name: "Ainārs Bašķis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "84", name: "Līga Krapāne", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "85", name: "Normunds Žunna", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "86", name: "Andris Šuvajevs", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "87", name: "Kārlis Šadurskis", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "88", name: "Uģis Mitrevics", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "89", name: "Zigfrīds Lukaševičs", faction: "Frakcija \"APVIENOTAIS SARAKSTS\"", votes: 0 },
      { id: "90", name: "Līga Meņģelsone", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "91", name: "Inese Voika", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "92", name: "Ilga Šuplinska", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "93", name: "Māris Možvillo", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "94", name: "Jānis Urbanovičs", faction: "Saskaņas Sociāldemokrātiskā partija", votes: 0 },
      { id: "95", name: "Inguna Rībena", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 },
      { id: "96", name: "Ivars Zariņš", faction: "Saskaņas Sociāldemokrātiskā partija", votes: 0 },
      { id: "97", name: "Regīna Ločmele-Luņova", faction: "Saskaņas Sociāldemokrātiskā partija", votes: 0 },
      { id: "98", name: "Jānis Vucāns", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "99", name: "Jānis Zemnieks", faction: "JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "100", name: "Andris Zīle", faction: "Frakcija \"Nacionālā apvienība\"", votes: 0 }
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
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getDeputies(): Promise<Deputy[]> {
    return Array.from(this.deputies.values());
  }

  async getUserVotes(userId: number): Promise<UserVote | undefined> {
    return this.userVotes.get(userId);
  }

  async createUserVotes(userId: number): Promise<UserVote> {
    const userVote = {
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
