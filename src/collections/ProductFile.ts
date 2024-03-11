import { User } from "../payload-types";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Access, CollectionConfig } from "payload/types";
import { boolean } from "zod";

const addUser: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.id }; //spreading data then adding userId with data
};

const youOwnOrPurchased: Access = async ({ req }) => {
  //who is making the req.
  const user = req.user as User | null;

  if (user?.role === "admin") return true;
  if (!user) return false;

  //if you own the file
  const { docs: products } = await req.payload.find({
    collection: "products",
    //Filter the products own by the logged in user
    depth: 0, //only care about the id, not the whole user information
    where: {
      user: {
        equals: user.id,
      },
    },
  });
  //filter out the ids of the products. flat() is for making sure only the product ids are taken as array
  const ownProductFileIds = products.map((prod) => prod.product_files).flat();

  //fetch the product ids that user bought
  const { docs: orders } = await req.payload.find({
    collection: "orders",
    //Filter the order own by the logged in user
    depth: 2, // takes actual user & their products
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  //filter out the parched product id.
  const purchasedProductFileIds = orders
    .map((order) => {
      return order.products.map((product) => {
        if (typeof product === "string")
          return req.payload.logger.error(
            "Search depth not sufficient to find purchased file IDs"
          );

        //if its a actual product return this turnery
        return typeof product.product_files === "string"
          ? product.product_files
          : product.product_files.id; //if not string(entire product info) then we just take the product id
      });
    })
    .filter(Boolean) //will take out undefined values of array
    .flat();

  //query constrain where id of the product files needs to be in an array where we spread both of our product ids(products we own and we bought).
  //we are checking if the file we requested is within this array, if it is then we can access it.
  return {
    id: {
      in: [...ownProductFileIds, ...purchasedProductFileIds],
    },
  };
};

export const ProductFiles: CollectionConfig = {
  slug: "product_files",
  admin: {
    hidden: ({ user }) => user.role !== "admin",
  },
  //We have created the relation but we need to set the users
  hooks: {
    beforeChange: [addUser],
  },

  access: {
    //only the people who uploaded or bought the file will be able to access.
    read: youOwnOrPurchased,
    update: ({ req }) => req.user.role === "admin",
    delete: ({ req }) => req.user.role === "admin", //so users cant delete their products.
  },

  //for images, icons, fonts etc. digital assets
  upload: {
    staticURL: "/product_files",
    staticDir: "product_files",
    mimeTypes: ["image/*", "font/*", "application/postscript"],
  },
  //product files are going nto be associated with a user
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      admin: {
        condition: () => false,
      },
      hasMany: false,
      required: true, //So we don't get any product files without users
    },
  ],
};
