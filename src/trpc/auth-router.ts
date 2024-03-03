//separate api endpoint that handles all authentication logic

import { AuthCredentialsValidator } from "../lib/validators/account-credentials-validator";
import { publicProcedure, router } from "./trpc";
import { getPayloadClient } from "../get-payload";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  createPayloadUser: publicProcedure
    .input(AuthCredentialsValidator) //getting the email and password from the frontend
    .mutation(async ({ input }) => {
      // accessing email and password
      const { email, password } = input;
      //accessing CMS to create the user
      const payload = await getPayloadClient();

      //check if user already exists
      const { docs: users } = await payload.find({
        collection: "users",
        where: {
          email: {
            equals: email,
          },
        },
      });

      //if the operation found a user we throw an error
      if (users.length !== 0) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      //creating new user
      await payload.create({
        collection: "users",
        data: {
          email,
          password,
          role: "user",
        },
      });
      return { success: true, sentToEmail: email };
    }),
});
