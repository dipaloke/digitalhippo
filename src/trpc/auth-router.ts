//separate api endpoint that handles all authentication logic

import { AuthCredentialsValidator } from "../lib/validators/account-credentials-validator";
import { publicProcedure, router } from "./trpc";
import { getPayloadClient } from "../get-payload";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = router({
  //api for Creating Users
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

  //api endpoint to verify users email
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const { token } = input;

      //get access to cms client
      const payload = await getPayloadClient();
      const isVerified = await payload.verifyEmail({
        collection: "users",
        token,
      });

      if (!isVerified) throw new TRPCError({ code: "UNAUTHORIZED" });
      return { success: true };
    }),

  //sign-in api endpoint
  signIn: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const { res } = ctx;

      const payload = await getPayloadClient();

      //logging-in the user in server
      try {
        await payload.login({
          collection: "users",
          data: {
            email,
            password,
          },
          res, //returning authentication token (cookie) from server.
        });
        return { success: true };
      } catch (err) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),
});
