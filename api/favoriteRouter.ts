import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { favorites } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const favoriteRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.favorites.findMany({
      where: eq(favorites.userId, ctx.user.id),
      orderBy: desc(favorites.createdAt),
    });
  }),

  add: authedQuery
    .input(
      z.object({
        targetType: z.string(),
        targetId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(favorites).values({
        ...input,
        userId: ctx.user.id,
      });
      return { success: true };
    }),

  remove: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(favorites).where(eq(favorites.id, input.id));
      return { success: true };
    }),

  isFavorited: authedQuery
    .input(
      z.object({
        targetType: z.string(),
        targetId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const fav = await db.query.favorites.findFirst({
        where: (f) =>
          eq(f.userId, ctx.user.id) &&
          eq(f.targetType, input.targetType) &&
          eq(f.targetId, input.targetId),
      });
      return !!fav;
    }),
});
