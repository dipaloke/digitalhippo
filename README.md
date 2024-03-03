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

- Payload CMS will be cashed to save resources.
- We use our own created server via express. Server is Self Hosted (can be deployed anywhere)
- From server we send emails, log users, authenticate users, manage products
- We are using mongoDB.
- We use tRPC to make both FrontEnd and BackEnd typeSafe.

## Packages :

- ShadCn : UI : Sign-up page(input, label,)

- LucideReact : Icons

- Express & type/express : For selfHosting our app without Vercel.

- Dotenv : Loads environment variables from a .env file into process.env.

- Payload : Headless CMS.
-- @payloadcms/richtext-slate : Slate Rich Text Editor for Payload.
-- @payloadcms/bundler-webpack: Official Webpack adapter for Payload.
-- @payloadcms/db-mongodb : Official MongoDB adapter for Payload.

- Cross-env : Run scripts that set and use environment variables across platforms. For us between express and Next.js

- react-hook-form, @hookform/resolver : Performant, flexible and extensible forms with easy-to-use validation.
- Zod: schema validation library.
- Sonner: toast message (opinionated toast component for React).

- tRPC: makes sure the front and backend have same types making both typeSafe.
-
