"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
//Schema for creating users table
exports.Users = {
    slug: "users",
    auth: {
        verify: {
            // customize the email from here
            generateEmailHTML: function (_a) {
                var token = _a.token;
                return "<a href=\"".concat(process.env.NEXT_PUBLIC_SERVER_URL, "/verify-email?token=").concat(token, "\">Verify account</a>");
            },
        },
    },
    access: {
        //using access we control users access to resources
        read: function () { return true; },
        create: function () { return true; },
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
