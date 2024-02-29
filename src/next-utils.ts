import next from "next";

const PORT = Number(process.env.PORT) || 3000;

export const nextApp = next({
  dev: process.env.NODE_ENV !== "production",
  port: PORT,
});

//for selfHosting this app. We are forwarding all logic to nextjs using nextApp utility
export const nextHandler = nextApp.getRequestHandler()
