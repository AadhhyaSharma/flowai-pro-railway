import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import {
  getUserWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getWorkflowRuns,
  createWorkflowRun,
  updateWorkflowRun,
  getUserSettings,
  updateUserSettings,
} from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ─────────────────────────────────────────────────────────────────────────────
  // Workflow procedures
  // ─────────────────────────────────────────────────────────────────────────────
  workflows: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserWorkflows(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getWorkflowById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({ name: z.string(), description: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        return await createWorkflow(ctx.user.id, input.name, input.description);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(['active', 'inactive']).optional(),
          nodes: z.any().optional(),
          edges: z.any().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        return await updateWorkflow(id, ctx.user.id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await deleteWorkflow(input.id, ctx.user.id);
      }),
  }),

  // ─────────────────────────────────────────────────────────────────────────────
  // Workflow run procedures
  // ─────────────────────────────────────────────────────────────────────────────
  runs: router({
    list: protectedProcedure
      .input(z.object({ workflowId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await getWorkflowRuns(input.workflowId, input.limit);
      }),

    create: protectedProcedure
      .input(z.object({ workflowId: z.number(), trigger: z.string().optional() }))
      .mutation(async ({ input }) => {
        return await createWorkflowRun(input.workflowId, input.trigger);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(['idle', 'running', 'success', 'error']).optional(),
          duration: z.number().optional(),
          output: z.any().optional(),
          error: z.string().optional(),
          nodeStatuses: z.any().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await updateWorkflowRun(id, updates);
      }),
  }),

  // ─────────────────────────────────────────────────────────────────────────────
  // User settings procedures
  // ─────────────────────────────────────────────────────────────────────────────
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getUserSettings(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          geminiKey: z.string().optional(),
          telegramKey: z.string().optional(),
          webhookSecret: z.string().optional(),
          preferences: z.any().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await updateUserSettings(ctx.user.id, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
