import { User } from "../payload-types";
import { Access, CollectionConfig } from "payload/types";

//Going to return an Access policy to determine can user read this image or not
const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined;
    if (!user) return false; //can't read image
    if (user.role === "admin") return true; //can read

    return {
      //if image user field equals currently logged in user, then its same users image.
      user: {
        equals: req.user.id,
      },
    };
  };

//this table will al;low users to upload product images
export const Media: CollectionConfig = {
  slug: "media",
  hooks: {
    //before change the product we invoke custom functions
    beforeChange: [
      ({ req, data }) => {
        //product image should be associated with a user to prevent users from accessing other users media
        return { ...data, user: req.user.id };
      },
    ],
  },

  //Implementing the access control for Images. (users can only see his own images)
  access: {
    read: async ({ req }) => {
      //only for dashboard not frontend
      const referer = req.headers.referer;
      //if user logged in or req coming from dashboard
      if (!req.user || !referer?.includes("sell")) {
        return true;
      }

      return await isAdminOrHasAccessToImages()({ req });
    },
    delete: isAdminOrHasAccessToImages(),
    update: isAdminOrHasAccessToImages(),
  },
  //Disabling Media as a separate category to show in dashboard. Coz we don't need to upload images separately.
  admin: {
    hidden: ({ user }) => user.role !== "admin",
  },

  upload: {
    staticURL: "/media",
    staticDir: "media", //directory where media files will be stored
    imageSizes: [
      //generating different image sizes to use. Will use different image sizes according to screen
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 1024,
        position: "centre",
      },
      {
        name: "tablet",
        width: 1024,
        height: undefined,
        position: "centre",
      },
    ],
    //only files with image extension are allowed to upload
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      //the relation with the user and image
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      admin: {
        condition: () => false,
      },
    },
  ],
};
