import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { terms, translationTasks } from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// Simple translation dictionary for demo
const zhToRuDict: Record<string, string> = {
  "石油": "нефть",
  "天然气": "природный газ",
  "煤炭": "уголь",
  "电力": "электроэнергия",
  "能源": "энергия",
  "装备": "оборудование",
  "开采": "добыча",
  "管道": "трубопровод",
  "阀门": "клапан",
  "泵": "насос",
  "压缩机": "компрессор",
  "发电机": "генератор",
  "变压器": "трансформатор",
  "钻井": "бурение",
  "炼油": "нефтепереработка",
  "化工": "химическая промышленность",
  "新能源": "возобновляемая энергия",
  "太阳能": "солнечная энергия",
  "风能": "ветровая энергия",
  "核能": "ядерная энергия",
  "合同": "контракт",
  "招标": "тендер",
  "谈判": "переговоры",
  "出口": "экспорт",
  "进口": "импорт",
  "价格": "цена",
  "质量": "качество",
  "标准": "стандарт",
  "技术": "технология",
  "设备": "оборудование",
  "安装": "установка",
  "维护": "обслуживание",
  "安全": "безопасность",
  "环保": "охрана окружающей среды",
  "项目": "проект",
  "投资": "инвестиция",
  "市场": "рынок",
  "公司": "компания",
  "协议": "соглашение",
};

const ruToZhDict: Record<string, string> = Object.fromEntries(
  Object.entries(zhToRuDict).map(([k, v]) => [v, k])
);

function findMatchedTerms(text: string): Array<{ cn: string; ru: string }> {
  const matched: Array<{ cn: string; ru: string }> = [];
  for (const [zh, ru] of Object.entries(zhToRuDict)) {
    if (text.includes(zh)) {
      matched.push({ cn: zh, ru });
    }
  }
  return matched;
}

export const translateRouter = createRouter({
  text: publicQuery
    .input(
      z.object({
        text: z.string().min(1).max(5000),
        sourceLang: z.enum(["zh", "ru"]).default("zh"),
        targetLang: z.enum(["zh", "ru"]).default("ru"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const dict = input.sourceLang === "zh" ? zhToRuDict : ruToZhDict;
      
      // Simple word-by-word translation
      let result = input.text;
      const matched: Array<{ source: string; target: string }> = [];
      
      for (const [source, target] of Object.entries(dict)) {
        if (result.includes(source)) {
          result = result.replace(new RegExp(source, "g"), target);
          matched.push({ source, target });
        }
      }

      const matchedTerms = findMatchedTerms(input.text);

      if (ctx.user) {
        const db = getDb();
        await db.insert(translationTasks).values({
          userId: ctx.user.id,
          sourceLang: input.sourceLang,
          targetLang: input.targetLang,
          sourceText: input.text,
          resultText: result,
          matchedTerms: JSON.stringify(matched),
          status: "completed",
        });
      }

      return {
        result,
        matchedTerms: matchedTerms.slice(0, 10),
        isMachineTranslated: true,
      };
    }),

  history: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.translationTasks.findMany({
      where: eq(translationTasks.userId, ctx.user.id),
      orderBy: desc(translationTasks.createdAt),
      limit: 20,
    });
  }),

  quickTranslate: publicQuery
    .input(z.object({ q: z.string().min(1).max(200) }))
    .query(async ({ input }) => {
      const db = getDb();
      // Search in terms database
      const matchedTerms = await db.query.terms.findMany({
        where: and(
          eq(terms.status, "active"),
          sql`${terms.cnTerm} LIKE ${`%${input.q}%`} OR ${terms.ruTerm} LIKE ${`%${input.q}%`}`
        ),
        limit: 5,
      });
      
      if (matchedTerms.length > 0) {
        return {
          found: true,
          terms: matchedTerms,
        };
      }

      // Try dictionary
      const dictMatch = zhToRuDict[input.q] || ruToZhDict[input.q];
      if (dictMatch) {
        return {
          found: true,
          terms: [{
            id: 0,
            cnTerm: input.q,
            ruTerm: dictMatch,
            enTerm: null,
            definition: null,
            context: null,
            cultureNote: null,
            pos: null,
            tags: null,
            status: "active" as const,
            version: 1,
            dbId: 0,
            createdBy: null,
            updatedBy: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }],
        };
      }

      return { found: false, terms: [] };
    }),
});
