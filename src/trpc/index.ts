import { publicProcedure, router } from "./trpc";

//this is backend

export const appRouter = router({
  //API endpoint
  anyApiRoute: publicProcedure.query(() => {
    return "hello";
  }),
});

export type AppRouter = typeof appRouter;
