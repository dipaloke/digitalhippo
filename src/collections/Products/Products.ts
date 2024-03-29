import { Product, User } from "../../payload-types";
import { PRODUCT_CATAGORIES } from "../../config";
import { slateEditor } from "@payloadcms/richtext-slate";
import { Access, CollectionConfig } from "payload/types";
import {
  AfterChangeHook,
  BeforeChangeHook,
} from "payload/dist/collections/config/types";
import { stripe } from "../../lib/stripe";

//before product is created
const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
  const user = req.user;
  return { ...data, user: user.id };
};

//after product is created.
//functionality to connect users against their created product.(to keep data integrity)
const syncUser: AfterChangeHook<Product> = async ({ req, doc }) => {
  //getting the full user obj
  const fullUser = await req.payload.findByID({
    collection: "users",
    id: req.user.id,
  });

  if (fullUser && typeof fullUser === "object") {
    //all the products user created
    const { products } = fullUser;

    const allIds = [
      ...(products?.map((product) =>
        typeof product === "object" ? product.id : product
      ) || []),
    ];

    //filter the ids
    const createdProductIds = allIds.filter(
      (id, index) => allIds.indexOf(id) === index
    );

    const dataToUpdate = [...createdProductIds, doc.id];

    //sync with DB
    await req.payload.update({
      collection: "users",
      id: fullUser.id,
      data: {
        products: dataToUpdate,
      },
    });
  }
};

//you can read only your product
const isAdminorHasAccess =
  (): Access =>
  ({ req: { user: _user } }) => {
    const user = _user as User | undefined;
    if (!user) return false;
    if (user.role === "admin") return true;

    const userProductIds = (user.products || []).reduce<Array<string>>(
      (acc, product) => {
        if (!product) return acc;
        if (typeof product === "string") {
          acc.push(product);
        } else {
          acc.push(product.id);
        }
        return acc;
      },
      []
    );
    return {
      id: {
        in: userProductIds,
      },
    };
  };

export const Products: CollectionConfig = {
  slug: "products",
  //in admin dashboard we are going to use the name field as default value
  admin: {
    useAsTitle: "name",
  },
  //access rules will determine who can access which part of the product.
  access: {
    read: isAdminorHasAccess(),
    update: isAdminorHasAccess(),
    delete: isAdminorHasAccess(),
  },
  hooks: {
    //sync user with their created products
    afterChange: [syncUser],
    beforeChange: [
      //this code will run before a product is saved to our database
      addUser,
      async (args) => {
        //if user is creating a product then we also need to get an stripe id for the product(create product).
        if (args.operation === "create") {
          const data = args.data as Product;

          const createdProduct = await stripe.products.create({
            name: data.name,
            default_price_data: {
              currency: "USD",
              unit_amount: Math.round(data.price * 100), //price in cents
            },
          });
          //Now updating our product with following fields before gets saved in db
          const updated: Product = {
            ...data,
            stripeId: createdProduct.id,
            priceId: createdProduct.default_price as string,
          };
          return updated;
        } else if (args.operation === "update") {
          //we don't need new stripe id if product is being updated.
          const data = args.data as Product;

          const updatedProduct = await stripe.products.update(data.stripeId!, {
            name: data.name,
            default_price: data.priceId!,
          });
          //Now updating our product with following fields before gets saved in db
          const updated: Product = {
            ...data,
            stripeId: updatedProduct.id,
            priceId: updatedProduct.default_price as string,
          };
          return updated;
        }
      },
    ],
  },
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
      label: "Description",
      type: "richText",
      editor: slateEditor({
        admin: {
          upload: {
            collections: {
              media: {
                fields: [
                  {
                    type: "richText",
                    name: "description",
                    label: "Product details",
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
                          "blockquote",
                          "link",
                          "ol",
                          "ul",
                          "textAlign",
                          "indent",
                          "relationship",
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
                  },
                ],
              },
            },
          },
        },
      }),
      required: true,
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
    {
      name: "product_files",
      label: "Product file(s)",
      type: "relationship",
      required: true,
      relationTo: "product_files", //another collection
      hasMany: false,
    },
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
