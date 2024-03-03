//entry point to express server to selfHost our app. No need vercel. Any node supported server is ok.

import e from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";

const app = e();
const PORT = Number(process.env.PORT) || 3000; //Change Port number according to host provided port number, when hosting on server.

// allows us to take something from express (ex: req, res), then attaches them to context to make then useable in nextJs.
const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res,
});

const start = async () => {
  //we are going to use PAYLOAD headless cms for admin dashboard
  //super similar as DB Client
  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()}`);
      },
    },
  });

  //forward the req to tRPC next js to handle it.
  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  //express middleware for req and res.Each req and res we just forward to nextJs
  app.use((req, res) => nextHandler(req, res));

  nextApp.prepare().then(() => {
    payload.logger.info("Next.js started");

    app.listen(PORT, async () => {
      payload.logger.info(
        `Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
      );
    });
  });
};
start();
