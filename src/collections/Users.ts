import { PrimaryActionEmailHtml } from "@/components/emails/PrimaryActionEmail";
import { Access, CollectionConfig } from "payload/types";

//only admins and user can see logged in user
const adminsAndUser: Access = ({ req: { user } }) => {
  if (user.role === "admin") return true;

  return {
    id: {
      equals: user.id,
    },
  };
};

//Schema for creating users table
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    verify: {
      // customize the email from here
      generateEmailHTML: ({ token }) => {
        return PrimaryActionEmailHtml({
          actionLabel: "Verify your acfcount",
          buttonText: "Verify Account",
          href: `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}`,
        });
      },
    },
  },

  access: {
    //using access we control users access to resources
    read: adminsAndUser,
    create: () => true,
    //only admin can update or delete an user
    update: ({ req }) => req.user.role === "admin",
    delete: ({ req }) => req.user.role === "admin",
  },
  //admin visibility: hidden for users that are not admin.
  admin: {
    hidden: ({ user }) => user.role !== "admin",
    defaultColumns: ["id"],
  },
  fields: [
    //multiple products under a user.
    {
      name: "products",
      label: "Products",
      admin: {
        condition: () => false,
      },
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
    {
      name: "product_files",
      label: "Product files",
      admin: {
        condition: () => false,
      },
      type: "relationship",
      relationTo: "product_files",
      hasMany: true,
    },
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
