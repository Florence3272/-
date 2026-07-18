import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, createToken } from "./local-auth";

// Use z.any() to avoid ALL zod schema matching issues
// Then validate manually with clear Chinese error messages
const anyObj = z.record(z.any()).or(z.any());

function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function isValidUsername(u: string): boolean {
  return /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/.test(u);
}

export const authRouter = createRouter({
  register: publicQuery
    .input(anyObj)
    .mutation(async ({ input }) => {
      const raw = input as Record<string, unknown>;

      const username = toStr(raw.username).trim();
      const password = toStr(raw.password);
      const name = toStr(raw.name).trim();

      // Manual validation with clear errors
      if (!username) throw new TRPCError({ code: "BAD_REQUEST", message: "用户名不能为空" });
      if (username.length < 3) throw new TRPCError({ code: "BAD_REQUEST", message: "用户名至少3个字符" });
      if (username.length > 20) throw new TRPCError({ code: "BAD_REQUEST", message: "用户名最多20个字符" });
      if (!isValidUsername(username)) throw new TRPCError({ code: "BAD_REQUEST", message: "用户名只能含字母、数字、下划线和汉字" });

      if (!password) throw new TRPCError({ code: "BAD_REQUEST", message: "密码不能为空" });
      if (password.length < 6) throw new TRPCError({ code: "BAD_REQUEST", message: "密码至少6个字符" });
      if (password.length > 30) throw new TRPCError({ code: "BAD_REQUEST", message: "密码最多30个字符" });

      const db = getDb();

      const existing = await db.query.users.findFirst({
        where: eq(users.username, username),
      });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "用户名已存在" });

      const passwordHash = await hashPassword(password);
      const result = await db.insert(users).values({
        username,
        passwordHash,
        name: name || username,
      }).$returningId();

      const userId = result[0].id;
      const token = await createToken(userId);

      return { token, userId };
    }),

  login: publicQuery
    .input(anyObj)
    .mutation(async ({ input }) => {
      const raw = input as Record<string, unknown>;

      const username = toStr(raw.username).trim();
      const password = toStr(raw.password);

      if (!username) throw new TRPCError({ code: "BAD_REQUEST", message: "请输入用户名" });
      if (!password) throw new TRPCError({ code: "BAD_REQUEST", message: "请输入密码" });

      const db = getDb();

      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "用户名或密码错误" });

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "用户名或密码错误" });

      await db.update(users)
        .set({ lastSignInAt: new Date() })
        .where(eq(users.id, user.id));

      const token = await createToken(user.id);
      return { token, userId: user.id };
    }),

  me: authedQuery.query(({ ctx }) => ctx.user),

  logout: authedQuery.mutation(() => ({ success: true })),
});
