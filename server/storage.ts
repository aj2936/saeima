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
      { id: "2", name: "Česlavs Batņa", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "3", name: "Raimonds Bergmanis", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "4", name: "Andris Bērziņš", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "5", name: "Anita Brakovska", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "6", name: "Augusts Brigmanis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "7", name: "Oļegs Burovs", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "8", name: "Artūrs Butāns", faction: "Frakcija Nacionālā apvienība", votes: 0 },
      { id: "9", name: "Andrejs Ceļapīters", faction: "Pie frakcijām nepiederošie deputāti", votes: 0 },
      { id: "10", name: "Edmunds Cepurītis", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "11", name: "Jānis Dombrava", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "12", name: "Aija Dukša", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "13", name: "Aldis Gobzems", faction: "Frakcija Latvijas Reģionu apvienība", votes: 0 },
      { id: "14", name: "Vineta Muižniece", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "15", name: "Jānis Vitenbergs", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "16", name: "Imants Parādnieks", faction: "Frakcija KPV LV", votes: 0 },
      { id: "17", name: "Jānis Rozenbergs", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "18", name: "Andrejs Judins", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "19", name: "Viktorija Šilova", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "20", name: "Rihards Kols", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "21", name: "Rasa Jukneviča", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "22", name: "Artis Pabriks", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "23", name: "Aivars Paula", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "24", name: "Juris Rancāns", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "25", name: "Jānis Reirs", faction: "Frakcija Vienotība", votes: 0 },
      { id: "26", name: "Edgars Tavars", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "27", name: "Ilze Viņķele", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "28", name: "Mārtiņš Bondars", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "29", name: "Dace Melbārde", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "30", name: "Zane Mežauere", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "31", name: "Andrejs Mamikins", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "32", name: "Jevgeņijs Mihailovs", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "33", name: "Jānis Putniņš", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "34", name: "Aleksejs Rosļikovs", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "35", name: "Andrejs Šuvajevs", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "36", name: "Dana Reizniece-Ozola", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "37", name: "Jānis Štālbergs", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "38", name: "Jānis Rubulis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "39", name: "Elīna Sprūde", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "40", name: "Inese Lībiņa-Egnere", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "41", name: "Valentīna Batņa", faction: "Frakcija KPV LV", votes: 0 },
      { id: "42", name: "Uldis Pīlēns", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "43", name: "Aivars Bergmanis", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "44", name: "Jānis Žīgurts", faction: "Frakcija Nacionālā apvienība", votes: 0 },
      { id: "45", name: "Armands Krauze", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "46", name: "Jānis Lībergs", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "47", name: "Rihards Kols", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "48", name: "Juris Pūce", faction: "Frakcija Nacionālā apvienība", votes: 0 },
      { id: "49", name: "Anda Čakša", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "50", name: "Jānis Bordāns", faction: "Frakcija Nacionālā apvienība", votes: 0 },
      { id: "51", name: "Mārtiņš Šics", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "52", name: "Māris Kučinskis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "53", name: "Ainārs Latkovskis", faction: "Frakcija Nacionālā apvienība", votes: 0 },
      { id: "54", name: "Ieva Brante", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "55", name: "Edgars Jaunups", faction: "Frakcija Nacionālā apvienība", votes: 0 },
      { id: "56", name: "Romāns Naudiņš", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "57", name: "Jānis Iesalnieks", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "58", name: "Jānis Strazds", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "59", name: "Jānis Ādamsons", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "60", name: "Ingrīda Circene", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "61", name: "Kristaps Feldmanis", faction: "Frakcija KPV LV", votes: 0 },
      { id: "62", name: "Gints Kaminskis", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "63", name: "Jānis Dombrava", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "64", name: "Andrejs Krastiņš", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "65", name: "Ainars Šlesers", faction: "Frakcija Latvijas attīstībai", votes: 0 },
      { id: "66", name: "Jānis Straume", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "67", name: "Gatis Eglītis", faction: "Frakcija KPV LV", votes: 0 },
      { id: "68", name: "Jānis Reirs", faction: "Frakcija Vienotība", votes: 0 },
      { id: "69", name: "Rihards Kols", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "70", name: "Rasa Jukneviča", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "71", name: "Artis Pabriks", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "72", name: "Aivars Paula", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "73", name: "Juris Rancāns", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "74", name: "Jānis Reirs", faction: "Frakcija Vienotība", votes: 0 },
      { id: "75", name: "Edgars Tavars", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "76", name: "Ilze Viņķele", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "77", name: "Mārtiņš Bondars", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "78", name: "Dace Melbārde", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "79", name: "Zane Mežauere", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "80", name: "Andrejs Mamikins", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "81", name: "Jevgeņijs Mihailovs", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "82", name: "Jānis Putniņš", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "83", name: "Aleksejs Rosļikovs", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "84", name: "Andrejs Šuvajevs", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "85", name: "Dana Reizniece-Ozola", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "86", name: "Jānis Štālbergs", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "87", name: "Jānis Rubulis", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "88", name: "Elīna Sprūde", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "89", name: "Inese Lībiņa-Egnere", faction: "Frakcija PROGRESĪVIE", votes: 0 },
      { id: "90", name: "Valentīna Batņa", faction: "Frakcija KPV LV", votes: 0 },
      { id: "91", name: "Uldis Pīlēns", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "92", name: "Aivars Bergmanis", faction: "Frakcija APVIENOTAIS SARAKSTS", votes: 0 },
      { id: "93", name: "Jānis Žīgurts", faction: "Frakcija Nacionālā apvienība", votes: 0 },
      { id: "94", name: "Armands Krauze", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "95", name: "Jānis Lībergs", faction: "Frakcija JAUNĀ VIENOTĪBA", votes: 0 },
      { id: "96", name: "Juris Pūce", faction: "Frakcija Nacionālā apvienība", votes: 0 },
      { id: "97", name: "Anda Čakša", faction: "Zaļo un Zemnieku savienības frakcija", votes: 0 },
      { id: "98", name: "Jānis Bordāns", faction: "Frakcija Nacionālā apvienība", votes: 0 },
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