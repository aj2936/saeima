import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const deputies = pgTable("deputies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  faction: text("faction").notNull(),
  votes: integer("votes").notNull().default(0),
});

export const userVotes = pgTable("user_votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  hasVoted: boolean("has_voted").notNull().default(false),
  votedDeputies: text("voted_deputies").array().notNull().default([]),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  username: z.string().min(1, "Lietotājvārds ir obligāts").email("Jābūt derīgai e-pasta adresei"),
  password: z.string().min(6, "Parolei jābūt vismaz 6 simbolus garai"),
});

export const insertUserVoteSchema = createInsertSchema(userVotes).pick({
  userId: true,
  hasVoted: true,
  votedDeputies: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Deputy = typeof deputies.$inferSelect;
export type UserVote = typeof userVotes.$inferSelect;