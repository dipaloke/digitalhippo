//entry point to express server to selfHost our app. No need vercel. Any node supported server is ok.

import e from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";

const app = e();
const PORT = Number(process.env.PORT) || 3000; //Change Port number according to host provided port number, when hosting on server.

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
