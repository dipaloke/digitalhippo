import { CollectionConfig } from "payload/types";

//Schema for creating users table
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  access: {
    //using access we control users access to resources
    read: () => true,
    create: () => true,
  },
  fields: [
    //each field is like an entry to database row
    {
      name: "role",
      defaultValue: "user",
      required: true,
    //   admin: {// hides role field from admin dashboard for all users
    //     condition: () => false,
    //   },
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
    },
  ],
};
