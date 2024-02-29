This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Features :
-- Payload CMS will be cashed to save resources.
-- We use our own created server via express.
--From server we send emails, log users, authenticate users, manage products
-- We are using mongoDB


## Packages :

--ShadCn : UI

--LucideReact : Icons

--Express & type/express : For selfHosting our app without Vercel.

--Dotenv : Loads environment variables from a .env file into process.env.

--Payload : Headless CMS.
-- @payloadcms/richtext-slate : Slate Rich Text Editor for Payload.
-- @payloadcms/bundler-webpack: Official Webpack adapter for Payload.
-- @payloadcms/db-mongodb : Official MongoDB adapter for Payload.

--cross-env : Run scripts that set and use environment variables across platforms. For us between express and Next.js
