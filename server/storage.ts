import { db } from './db';
import { deputies as deputiesTable, users, userVotes } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { Deputy, User, UserVote } from '@shared/schema';
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(username: string, password: string): Promise<User>;
  getDeputies(): Promise<Deputy[]>;
  getUserVotes(userId: number): Promise<UserVote | undefined>;
  createUserVotes(userId: number): Promise<UserVote>;
  voteForDeputy(userId: number, deputyId: string): Promise<boolean>;
  sessionStore: session.Store;
}

export const storage = {
  async getDeputies(): Promise<Deputy[]> {
    return await db.select().from(deputiesTable);
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  },

  async createUser(username: string, password: string): Promise<User> {
    const [user] = await db.insert(users).values({ username, password }).returning();
    return user;
  },

  async getUserVotes(userId: number): Promise<UserVote | undefined> {
    const results = await db.select().from(userVotes).where(eq(userVotes.userId, userId));
    return results[0];
  },

  async createUserVotes(userId: number): Promise<UserVote> {
    const [votes] = await db.insert(userVotes)
      .values({ userId, hasVoted: false, votedDeputies: [] })
      .returning();
    return votes;
  },

  async voteForDeputy(userId: number, deputyId: string): Promise<boolean> {
    const votes = await this.getUserVotes(userId);
    if (!votes) return false;

    await db.transaction(async (tx) => {
      // Update user votes
      await tx.update(userVotes)
        .set({ 
          votedDeputies: [...votes.votedDeputies, deputyId],
          hasVoted: true 
        })
        .where(eq(userVotes.userId, userId));

      // Increment deputy votes
      await tx.update(deputiesTable)
        .set({ votes: db.raw('votes + 1') })
        .where(eq(deputiesTable.id, deputyId));
    });

    return true;
  },
  sessionStore: new MemoryStore({
    checkPeriod: 86400000,
  }),
};