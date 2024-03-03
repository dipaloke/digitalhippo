import { initTRPC } from "@trpc/server";

const t = initTRPC.context().create();

export const router = t.router;
//anyone can call this api endpoint
export const publicProcedure = t.procedure;