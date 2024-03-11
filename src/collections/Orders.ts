import { Access, CollectionConfig } from "payload/types";

const yourOwn: Access = ({ req: { user } }) => {
  if (user.role === "admin") return true;

  //otherwise query constrain where user id of the order needs to match the currently logged in user id
  //so you can read only your orders.
  return {
    user: {
      equals: user?.id,
    },
  };
};

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "Your Orders",
    description: "A summery of all your orders in DigitalHippo.",
  },
  access: {
    read: yourOwn,
    update: ({ req }) => req.user.role === "admin",
    delete: ({ req }) => req.user.role === "admin",
    create: ({ req }) => req.user.role === "admin",
  },
  fields: [
    {
      name: "_isPaid",
      type: "checkbox",
      //making sure users can't set their own products as paid
      access: {
        read: ({ req }) => req.user.role === "admin",
        create: () => false, //can only be created programmatically.
        update: () => false,
      },
      admin: {
        hidden: true,
      },
      required: true,
    },
    //relation to the user who made this order.
    {
      name: "user",
      type: "relationship",
      admin: {
        hidden: true,
      },
      relationTo: "users",
      required: true,
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      required: true,
      hasMany: true, //order can contain multiple products.
    },
  ],
};
