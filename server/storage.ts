import { users, deputies, userVotes, type User, type InsertUser, type Deputy, type UserVote } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export const storage = {
  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  },

  async getUser(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  },

  async getDeputies(): Promise<Deputy[]> {
    const allDeputies = await db.select().from(deputies);
    console.log(`Returning ${allDeputies.length} deputies`); 
    return allDeputies.sort((a, b) => b.votes - a.votes);
  },

  async getUserVotes(userId: number): Promise<UserVote | undefined> {
    const [userVote] = await db.select().from(userVotes).where(eq(userVotes.userId, userId));
    return userVote;
  },

  async createUserVotes(userId: number): Promise<UserVote> {
    const [userVote] = await db.insert(userVotes)
      .values({
        userId,
        hasVoted: false,
        votedDeputies: [],
      })
      .returning();
    return userVote;
  },

  async voteForDeputy(userId: number, deputyId: string): Promise<boolean> {
    const userVote = await this.getUserVotes(userId);
    if (!userVote || userVote.votedDeputies.length >= 5) return false;

    const [deputy] = await db.select().from(deputies).where(eq(deputies.id, deputyId));
    if (!deputy) return false;

    await db.transaction(async (tx) => {
      await tx.update(deputies)
        .set({ votes: deputy.votes + 1 })
        .where(eq(deputies.id, deputyId));

      await tx.update(userVotes)
        .set({ votedDeputies: [...userVote.votedDeputies, deputyId] })
        .where(eq(userVotes.userId, userId));
    });

    return true;
  }
};