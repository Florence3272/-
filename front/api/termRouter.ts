import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { terms, databases } from "@db/schema";
import { eq, desc, like, and, sql } from "drizzle-orm";

export const termRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        dbId: z.number(),
        search: z.string().optional(),
        pos: z.string().optional(),
        tags: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(terms.dbId, input.dbId), eq(terms.status, "active")];

      if (input.search) {
        conditions.push(
          sql`${terms.cnTerm} LIKE ${`%${input.search}%`} OR ${terms.ruTerm} LIKE ${`%${input.search}%`} OR ${terms.enTerm} LIKE ${`%${input.search}%`}`
        );
      }
      if (input.pos) {
        conditions.push(eq(terms.pos, input.pos));
      }
      if (input.tags) {
        conditions.push(like(terms.tags, `%${input.tags}%`));
      }

      return db.query.terms.findMany({
        where: and(...conditions),
        orderBy: desc(terms.updatedAt),
      });
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.terms.findFirst({
        where: eq(terms.id, input.id),
      });
    }),

  create: authedQuery
    .input(
      z.object({
        dbId: z.number(),
        cnTerm: z.string().min(1).max(255),
        ruTerm: z.string().min(1).max(255),
        enTerm: z.string().max(255).optional(),
        definition: z.string().optional(),
        context: z.string().optional(),
        cultureNote: z.string().optional(),
        pos: z.string().max(50).optional(),
        tags: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [result] = await db
        .insert(terms)
        .values({
          ...input,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        })
        .$returningId();

      await db
        .update(databases)
        .set({
          termCount: sql`(SELECT COUNT(*) FROM ${terms} WHERE ${terms.dbId} = ${input.dbId} AND ${terms.status} = 'active')`,
        })
        .where(eq(databases.id, input.dbId));

      return db.query.terms.findFirst({
        where: eq(terms.id, result.id),
      });
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        cnTerm: z.string().min(1).max(255).optional(),
        ruTerm: z.string().min(1).max(255).optional(),
        enTerm: z.string().max(255).optional(),
        definition: z.string().optional(),
        context: z.string().optional(),
        cultureNote: z.string().optional(),
        pos: z.string().max(50).optional(),
        tags: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...data } = input;

      await db
        .update(terms)
        .set({
          ...data,
          updatedBy: ctx.user.id,
          version: sql`${terms.version} + 1`,
        })
        .where(eq(terms.id, id));

      return db.query.terms.findFirst({
        where: eq(terms.id, id),
      });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const term = await db.query.terms.findFirst({
        where: eq(terms.id, input.id),
      });
      if (!term) return { success: false };

      await db
        .update(terms)
        .set({ status: "deleted" })
        .where(eq(terms.id, input.id));

      await db
        .update(databases)
        .set({
          termCount: sql`(SELECT COUNT(*) FROM ${terms} WHERE ${terms.dbId} = ${term.dbId} AND ${terms.status} = 'active')`,
        })
        .where(eq(databases.id, term.dbId));

      return { success: true };
    }),

  globalSearch: publicQuery
    .input(z.object({ q: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.terms.findMany({
        where: and(
          eq(terms.status, "active"),
          sql`${terms.cnTerm} LIKE ${`%${input.q}%`} OR ${terms.ruTerm} LIKE ${`%${input.q}%`} OR ${terms.enTerm} LIKE ${`%${input.q}%`} OR ${terms.definition} LIKE ${`%${input.q}%`}`
        ),
        limit: 50,
      });
    }),

  posList: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({ pos: terms.pos })
      .from(terms)
      .where(sql`${terms.pos} IS NOT NULL`)
      .groupBy(terms.pos);
    return result.map((r) => r.pos).filter(Boolean);
  }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const [totalTerms] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(terms)
      .where(eq(terms.status, "active"));
    return { totalTerms: totalTerms.count };
  }),
});
