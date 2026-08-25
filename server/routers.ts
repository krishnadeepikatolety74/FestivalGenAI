import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { generateAndPersistFestivalPlan } from "./festival-ai";
import { getLatestFestivalPlan } from "./db";

const generateInput = z.object({
  festival: z.string().min(2).max(120),
  city: z.string().min(2).max(160),
  familySize: z.number().int().min(1).max(50),
  budget: z.number().int().min(1).max(10_000_000),
  language: z.string().min(2).max(64),
  preferences: z.array(z.string().max(120)).max(20),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  plans: router({
    generate: publicProcedure.input(generateInput).mutation(async ({ input, ctx }) => {
      return generateAndPersistFestivalPlan(input, ctx.user?.id);
    }),
    latest: protectedProcedure.query(({ ctx }) => getLatestFestivalPlan(ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;
