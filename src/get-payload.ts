//This is a database client and made sure to cache it

import dotenv from "dotenv";
import path from "path";
import type { InitOptions } from "payload/config";
import payload, { Payload } from "payload";
import nodemailer from "nodemailer";

//Configure the .env file with dotenv
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

//Defining the transport for sending email verification
const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  secure: true,
  port: 465, //secure port for sending emails
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  },
});

//To save resources & get our client we will be using Caching.
//if variable cached(cached version of CMS) exists we are going to use it.
let cached = (global as any).payload;

//if variable cashed doesn't exists then save CMS as cashed
if (!cached) {
  cached = (global as any).payload = {
    client: null,
    promise: null,
  };
}

interface Args {
  initOptions?: Partial<InitOptions>;
}

//gets access to DB. from where send emails, log users, authenticate users, manage products
export const getPayloadClient = async ({
  initOptions,
}: Args = {}): Promise<Payload> => {
  // Args = {} initialize argument as default object
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error("PAYLOAD_SECRET is missing");
  }

  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    cached.promise = payload.init({
      email: {
        transport: transporter,
        fromAddress: "onboarding@resend.dev", //change here : your personal domain name. First add the domain to resend
        fromName: "DigitalHippo",
      },
      secret: process.env.PAYLOAD_SECRET,
      local: initOptions?.express ? false : true,
      ...(initOptions || {}),
    });
  }

  try {
    cached.client = await cached.promise;
  } catch (e: unknown) {
    cached.promise = null;
    throw e;
  }

  return cached.client;
};
