//entry point to express server to selfHost our app. No need vercel. Any node supported server is ok.

import e from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import bodyParser from "body-parser";
import { IncomingMessage } from "http";
import { stripeWebhookHandler } from "./webhooks";
import nextBuild from "next/dist/build";
import path from "path";
import { PayloadRequest } from "payload/types";
import { parse } from "url";

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

// export type ExpressContext = inferAsyncReturnType<typeof createContext>
export type ExpressContext = Awaited<ReturnType<typeof createContext>>;

export type WebhookRequest = IncomingMessage & { rawBody: Buffer };

const start = async () => {
  //stripe webhook middleware to modify the msg stripe sends us.
  const webhookMiddleware = bodyParser.json({
    verify: (req: WebhookRequest, _, buffer) => {
      req.rawBody = buffer;
    },
  });

  app.post("/api/webhooks/stripe", webhookMiddleware, stripeWebhookHandler);

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

  //security for cart page

  const cartRouter = e.Router();
  cartRouter.use(payload.authenticate); //attaches user obj to express req
  //whenever we are accessing the main page, we also get arrow function with req and res
  cartRouter.get("/", (req, res) => {
    const request = req as PayloadRequest;

    if (!request.user) return res.redirect("/sign-in?origin=cart");

    const parseUrl = parse(req.url, true);

    return nextApp.render(req, res, "/cart", parseUrl.query);
  });
  app.use("/cart", cartRouter);

  //build script for production
  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
      payload.logger.info("Next.js is building for production");
      //@ts-expect-error
      await nextBuild(path.join(__dirname, "../"));
      process.exit();
    });
    return;
  }

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
