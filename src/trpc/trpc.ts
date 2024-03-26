import { User } from "@/payload-types";
import { ExpressContext } from "@/server";
import { TRPCError, initTRPC } from "@trpc/server";
import { PayloadRequest } from "payload/types";

const t = initTRPC.context<ExpressContext>().create();
const middleware = t.middleware;

//authenticates user before accessing payment route.
const isAuthenticated = middleware(async ({ ctx, next }) => {
  const req = ctx.req as PayloadRequest; //req contains user info
  const { user } = req as { user: User | null };

  if (!user || !user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  //adding the user to the context of privateProcedure
  return next({
    ctx: {
      user,
    },
  });
});

export const router = t.router;
//anyone can call this api endpoint
export const publicProcedure = t.procedure;

//must be authenticated to access
export const privateProcedure = t.procedure.use(isAuthenticated);
