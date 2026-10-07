import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { resources } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const resourceRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        dbId: z.number(),
        moduleType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(resources.dbId, input.dbId)];
      if (input.moduleType) {
        conditions.push(eq(resources.moduleType, input.moduleType as "dialogue" | "reading" | "case" | "video" | "quiz" | "culture"));
      }
      return db.query.resources.findMany({
        where: and(...conditions),
        orderBy: desc(resources.createdAt),
      });
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.resources.findFirst({
        where: eq(resources.id, input.id),
      });
    }),

  create: authedQuery
    .input(
      z.object({
        dbId: z.number(),
        moduleType: z.enum(["dialogue", "reading", "case", "video", "quiz", "culture"]),
        title: z.string().min(1).max(255),
        content: z.string().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [result] = await db
        .insert(resources)
        .values({
          ...input,
          creatorId: ctx.user.id,
        })
        .$returningId();
      return db.query.resources.findFirst({
        where: eq(resources.id, result.id),
      });
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(resources).set(data).where(eq(resources.id, id));
      return db.query.resources.findFirst({
        where: eq(resources.id, id),
      });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(resources).where(eq(resources.id, input.id));
      return { success: true };
    }),

  moduleTypes: publicQuery.query(async () => {
    return [
      { value: "dialogue", label: "情境对话" },
      { value: "reading", label: "专业阅读" },
      { value: "case", label: "案例分析" },
      { value: "video", label: "微课视频" },
      { value: "quiz", label: "习题测试" },
      { value: "culture", label: "文化贴士" },
    ];
  }),
});
