

import { z } from "zod";
import { authRouter } from "./auth-router";
import { publicProcedure, router } from "./trpc";
import { QueryValidator } from "../lib/validators/query-validator";
import { getPayloadClient } from "../get-payload";

//this is backend

export const appRouter = router({
  //API endpoint
  auth: authRouter,

  //This is the logic for getting infinite products.

  getInfiniteProducts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.number().nullish(), //cursor is the last element rendered. While user is scrolling cursor will fetch the next page of products for infinite query.
        query: QueryValidator, //custom validator
      })
    )
    .query(async ({ input }) => {
      //business logic and querying our DB
      const { query, cursor } = input;
      const { sort, limit, ...queryOpts } = query;

      const payload = await getPayloadClient();

      //parsing of the query options.
      const parsesQueryOpts: Record<string, { equals: string }> = {};

      //taking our queryOpts obj and putting it into proper syntax so our CMS can understand
      Object.entries(queryOpts).forEach(([key, value]) => {
        parsesQueryOpts[key] = {
          equals: value,
        };
      });

      const page = cursor || 1

      const { docs: items, hasNextPage, nextPage } = await payload.find({
        collection: "products",
        where: {
          approvedForSale: {
            equals: "approved",
          },
          ...parsesQueryOpts,
        },
        sort,
        depth: 1, //fetch one level deep
        limit,
        page,
      });

      return {
        items,
        nextPage: hasNextPage ? nextPage : null
      }
    }),
});

export type AppRouter = typeof appRouter;
