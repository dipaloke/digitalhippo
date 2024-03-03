import { authRouter } from "./auth-router";
import { publicProcedure, router } from "./trpc";

//this is backend

export const appRouter = router({
  //API endpoint
 auth: authRouter
});

export type AppRouter = typeof appRouter;
