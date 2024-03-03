import { webpackBundler } from "@payloadcms/bundler-webpack";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { slateEditor } from "@payloadcms/richtext-slate";
import path from "path";
import { buildConfig } from "payload/config";
import { Users } from "./collections/Users";
import  dotenv  from "dotenv";


dotenv.config({
  path: path.resolve(__dirname, "../.env")
})

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "",
  collections: [Users], //collections:[] later will be our orders, products, users etc.
  routes: {
    admin: "/sell", // changing the default CMS admin URL(/admin) to (/sell)
  },
  admin: {
    user: "users",
    bundler: webpackBundler(),
    meta: {
      titleSuffix: "- DigitalHippo", // ex:products - DigitalHippo
      favicon: "/favicon.ico", //browser tab icon
      ogImage: "/thumbnail.jpg", //this img will show when this app is shred
    },
  },
  rateLimit: {
    max: 2000,
  },
  editor: slateEditor({}), //text editor
  db: mongooseAdapter({
    url: process.env.MONGODB_URL!, //super sensitive info
  }),
  typescript: {
    //keep front and back type safe
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
});
