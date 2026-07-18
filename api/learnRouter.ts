import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { terms, learningRecords, resources } from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const learnRouter = createRouter({
  flashcards: publicQuery
    .input(
      z.object({
        dbId: z.number().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(terms.status, "active")];
      if (input.dbId) {
        conditions.push(eq(terms.dbId, input.dbId));
      }
      return db.query.terms.findMany({
        where: and(...conditions),
        limit: input.limit,
        orderBy: sql`RAND()`,
      });
    }),

  quizQuestions: publicQuery
    .input(
      z.object({
        dbId: z.number().optional(),
        mode: z.enum(["zh_to_ru", "ru_to_zh", "fill_blank", "match"]).default("zh_to_ru"),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(terms.status, "active")];
      if (input.dbId) {
        conditions.push(eq(terms.dbId, input.dbId));
      }
      const selectedTerms = await db.query.terms.findMany({
        where: and(...conditions),
        limit: input.limit * 4,
        orderBy: sql`RAND()`,
      });

      const questions = selectedTerms.slice(0, input.limit).map((term, idx) => {
        const distractors = selectedTerms
          .filter((_, i) => i !== idx)
          .slice(0, 3);

        switch (input.mode) {
          case "zh_to_ru":
            return {
              id: term.id,
              question: `「${term.cnTerm}」的俄文是？`,
              correctAnswer: term.ruTerm,
              options: [term.ruTerm, ...distractors.map((d) => d.ruTerm)].sort(() => Math.random() - 0.5),
            };
          case "ru_to_zh":
            return {
              id: term.id,
              question: `「${term.ruTerm}」的中文是？`,
              correctAnswer: term.cnTerm,
              options: [term.cnTerm, ...distractors.map((d) => d.cnTerm)].sort(() => Math.random() - 0.5),
            };
          case "fill_blank":
            return {
              id: term.id,
              question: `填空：${term.definition?.replace(term.cnTerm, "_____") || term.cnTerm}`,
              correctAnswer: term.cnTerm,
              options: [term.cnTerm, ...distractors.map((d) => d.cnTerm)].sort(() => Math.random() - 0.5),
            };
          default:
            return {
              id: term.id,
              question: `「${term.cnTerm}」的释义是？`,
              correctAnswer: term.definition || "",
              options: [term.definition || "", ...distractors.map((d) => d.definition || "")].filter(Boolean).slice(0, 4),
            };
        }
      });

      return questions;
    }),

  record: authedQuery
    .input(
      z.object({
        targetType: z.string(),
        targetId: z.number(),
        mode: z.string(),
        score: z.number().optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(learningRecords).values({
        ...input,
        userId: ctx.user.id,
      });
      return { success: true };
    }),

  myRecords: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.learningRecords.findMany({
      where: eq(learningRecords.userId, ctx.user.id),
      orderBy: desc(learningRecords.createdAt),
      limit: 50,
    });
  }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const records = await db.query.learningRecords.findMany({
      where: eq(learningRecords.userId, ctx.user.id),
    });
    
    const totalDuration = records.reduce((sum, r) => sum + (r.duration || 0), 0);
    const totalScore = records.reduce((sum, r) => sum + (r.score || 0), 0);
    const quizRecords = records.filter((r) => r.mode === "quiz");
    
    return {
      totalSessions: records.length,
      totalDuration,
      avgScore: quizRecords.length > 0 ? Math.round(totalScore / quizRecords.length) : 0,
      quizCount: quizRecords.length,
    };
  }),

  compareTerms: publicQuery
    .input(z.object({ dbId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.terms.findMany({
        where: and(eq(terms.dbId, input.dbId), eq(terms.status, "active")),
        orderBy: desc(terms.updatedAt),
        limit: 20,
      });
    }),

  scenarioResources: publicQuery
    .input(z.object({ dbId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.resources.findMany({
        where: and(
          eq(resources.dbId, input.dbId),
          eq(resources.moduleType, "dialogue")
        ),
        orderBy: desc(resources.createdAt),
      });
    }),
});
