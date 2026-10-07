import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, databases, terms, learningRecords, translationTasks } from "@db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [userCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const [dbCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(databases);
    const [termCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(terms).where(eq(terms.status, "active"));
    const [recordCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(learningRecords);
    const [translationCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(translationTasks);
    
    return {
      userCount: userCount.count,
      dbCount: dbCount.count,
      termCount: termCount.count,
      recordCount: recordCount.count,
      translationCount: translationCount.count,
    };
  }),

  userList: adminQuery
    .input(
      z.object({
        search: z.string().optional(),
        role: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.role) {
        conditions.push(eq(users.role, input.role as "user" | "admin"));
      }
      
      return db.query.users.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: desc(users.createdAt),
        limit: 100,
      });
    }),

  updateUserRole: adminQuery
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));
      return { success: true };
    }),

  recentActivities: adminQuery.query(async () => {
    const db = getDb();
    const recentTerms = await db.query.terms.findMany({
      where: eq(terms.status, "active"),
      orderBy: desc(terms.createdAt),
      limit: 10,
    });
    const recentRecords = await db.query.learningRecords.findMany({
      orderBy: desc(learningRecords.createdAt),
      limit: 10,
    });
    
    return {
      recentTerms,
      recentRecords,
    };
  }),

  termGrowth: adminQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({
        month: sql<string>`DATE_FORMAT(${terms.createdAt}, '%Y-%m')`,
        count: sql<number>`COUNT(*)`,
      })
      .from(terms)
      .where(eq(terms.status, "active"))
      .groupBy(sql`DATE_FORMAT(${terms.createdAt}, '%Y-%m')`)
      .orderBy(desc(sql`DATE_FORMAT(${terms.createdAt}, '%Y-%m')`))
      .limit(12);
    return result;
  }),
});
