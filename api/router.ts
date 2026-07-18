import { authRouter } from "./auth-router";
import { databaseRouter } from "./databaseRouter";
import { termRouter } from "./termRouter";
import { resourceRouter } from "./resourceRouter";
import { learnRouter } from "./learnRouter";
import { translateRouter } from "./translateRouter";
import { favoriteRouter } from "./favoriteRouter";
import { adminRouter } from "./adminRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  database: databaseRouter,
  term: termRouter,
  resource: resourceRouter,
  learn: learnRouter,
  translate: translateRouter,
  favorite: favoriteRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
