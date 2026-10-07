import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateUser } from "./local-auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    // Read token from x-auth-token header
    const token = opts.req.headers.get("x-auth-token");
    if (token) {
      ctx.user = await authenticateUser(token) ?? undefined;
    }
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
