import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const applicationLogsTable = pgTable("application_logs", {
  id: serial("id").primaryKey(),
  applicantName: text("applicant_name").notNull(),
  position: text("position").notNull(),
  result: text("result").notNull(),
  reason: text("reason"),
  staffId: text("staff_id").notNull(),
  staffTag: text("staff_tag").notNull(),
  guildId: text("guild_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApplicationLogSchema = createInsertSchema(applicationLogsTable).omit({ id: true, createdAt: true });
export type InsertApplicationLog = z.infer<typeof insertApplicationLogSchema>;
export type ApplicationLog = typeof applicationLogsTable.$inferSelect;
