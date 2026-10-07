import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { databases, userDatabaseRoles } from "@db/schema";
import { eq, desc, like, and } from "drizzle-orm";

export const databaseRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(databases.status, "active")];
      
      if (input?.search) {
        conditions.push(like(databases.name, `%${input.search}%`));
      }
      if (input?.category) {
        conditions.push(eq(databases.category, input.category));
      }
      
      return db.query.databases.findMany({
        where: and(...conditions),
        orderBy: desc(databases.updatedAt),
      });
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.databases.findFirst({
        where: eq(databases.id, input.id),
      });
    }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        category: z.string().min(1).max(100),
        description: z.string().optional(),
        visibility: z.enum(["public", "private", "team"]).default("public"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [result] = await db.insert(databases).values({
        ...input,
        ownerId: ctx.user.id,
      }).$returningId();
      
      const newDb = await db.query.databases.findFirst({
        where: eq(databases.id, result.id),
      });
      
      await db.insert(userDatabaseRoles).values({
        userId: ctx.user.id,
        dbId: result.id,
        role: "admin",
      });
      
      return newDb;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        category: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        visibility: z.enum(["public", "private", "team"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      
      await db.update(databases).set(data).where(eq(databases.id, id));
      
      return db.query.databases.findFirst({
        where: eq(databases.id, id),
      });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(databases).where(eq(databases.id, input.id));
      return { success: true };
    }),

  archive: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(databases)
        .set({ status: "archived" })
        .where(eq(databases.id, input.id));
      return { success: true };
    }),

  categories: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({ category: databases.category })
      .from(databases)
      .groupBy(databases.category);
    return result.map((r) => r.category);
  }),
});
