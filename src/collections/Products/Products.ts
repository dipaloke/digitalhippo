import { PRODUCT_CATAGORIES } from "../../config";
import { slateEditor } from "@payloadcms/richtext-slate";
import { CollectionConfig } from "payload/types";

export const Products: CollectionConfig = {
  slug: "products",
  //in admin dashboard we are going to use the name field as default value
  admin: {
    useAsTitle: "name",
  },
  //access rules will determine who can access which part of the product.
  access: {},
  fields: [
    {
      name: "user", //who created the product.
      type: "relationship", //so we can connect users and products table
      relationTo: "users",
      required: true, // a product always needs to associated with a user
      hasMany: false, //same3 product can't be created by multiple users
      admin: {
        condition: () => false, //hides this options from admin dashboard(users don't need to see this field)
      },
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
    //richtext extra added by me.
    {
      name: "description",
      type: "richText",
      editor: slateEditor({
        admin: {
          elements: [
            // customize elements allowed in Slate editor here
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "h6",
            "h6",
            "blockquote",
            "link",
            "ol",
            "ul",
            "textAlign",
            "indent",
            "relationship",
            "upload",
            "textAlign",
          ],
          leaves: [
            // customize leaves allowed in Slate editor here
            "bold",
            "code",
            "italic",
            "strikethrough",
            "underline",
          ],
        },
      }),
      label: "Product details",
    },
    {
      name: "price",
      label: "Price in USD",
      min: 0,
      max: 10000,
      type: "number",
      required: true,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: PRODUCT_CATAGORIES.map(({ label, value }) => ({ label, value })),
      required: true,
    },
    // {
    //   name: "product_files",
    //   label: "Product file(s)",
    //   type: "relationship",
    //   required: true,
    //   relationTo: "product_files", //another collection
    //   hasMany: true, //can have multiple files
    // },
    //products needs to-be verified by admin
    {
      name: "approvedForSale",
      label: "Product status",
      type: "select",
      defaultValue: "pending",
      access: {
        //we are going to check if users are allowed to do this or not.
        //only admins are allowed to read, create or update.
        create: ({ req }) => req.user.role === "admin",
        read: ({ req }) => req.user.role === "admin",
        update: ({ req }) => req.user.role === "admin",
      },
      options: [
        {
          label: "Pending verification",
          value: "pending",
        },
        {
          label: "Approved",
          value: "approved",
        },
        {
          label: "Denied",
          value: "denied",
        },
      ],
    },
    //correspond to stripe priceId for payment
    {
      name: "priceId",
      access: {
        create: () => false, //no one should have permission to edit price
        read: () => false, //could only be overwritten in backend code
        update: () => false,
      },
      type: "text",
      admin: {
        hidden: true,
      },
    },
    //correspond to certain product
    {
      name: "stripeId",
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "images",
      label: "Product images",
      type: "array",
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: {
        singular: "Image",
        plural: "Images",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media", //another table
          required: true,
        },
      ],
    },
  ],
};
