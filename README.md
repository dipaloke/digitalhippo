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

- Change domain name for email verification in get-payload.ts & in resend.com

## Features :

- Payload CMS will be cashed to save resources.
- We use our own created server via express. Server is Self Hosted (can be deployed anywhere)
- From server we send emails, log users, authenticate users, manage products
- We are using mongoDB.
- We use tRPC to make both FrontEnd and BackEnd typeSafe.
- Resend is used for sending email verification.
- using origin, users will be redirected to sign-in page if user Authentication fails & redirect back where user was after signing in.
- Same User can buy or sell a product.
- Product images will be directly associated with the user not with the product to prevent users from
  accessing all the media files from other users.(Only for Dashboard not frontend)
- 4 products will be rendered side by side. Each products will have Image slider.
- Single product page will contain breadcrumbs.
- People can add/remove products to cart, also can clear the cart.
- stripe is used for checkout session. card & wechatPay are enabled.
- After payment people gets redirected to thankyou page, from where they can download the product.
- website will keep polling for stripe webhook until payment was made successfully. Otherwise we don't release the asset to download.
- Receipt Email template taken from ([react email](https://demo.react.email/)).
- User can't access sign-in or sign-up page if user is logged in.

## Packages :

- ShadCn : UI : Sign-up page(input, label, dropdown-menu, skelton, scrollArea)

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

- Nodemailer & @types/nodemailer : for sending emails from Node.js & for the nodemailer types.

- Swiper : Image slider

- Zustand : A small, fast and scalable bearbones state-management solution.

- Stripe: Node library provides convenient access to the Stripe API from applications.

- Body-parser : Parse incoming request bodies in a middleware before your handlers, available under the req.body property(works with express).


- Resend: Node.js library for the Resend API(for sending email).

- @react-email/components : collection of all components in react-email

- date-fns : simple and consistent toolset for manipulating JavaScript dates in a browser & Node.js

- copyfiles : for copying files easily.
