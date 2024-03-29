"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orders = void 0;
var yourOwn = function (_a) {
    var user = _a.req.user;
    if (user.role === "admin")
        return true;
    //otherwise query constrain where user id of the order needs to match the currently logged in user id
    //so you can read only your orders.
    return {
        user: {
            equals: user === null || user === void 0 ? void 0 : user.id,
        },
    };
};
exports.Orders = {
    slug: "orders",
    admin: {
        useAsTitle: "Your Orders",
        description: "A summery of all your orders in DigitalHippo.",
    },
    access: {
        read: yourOwn,
        update: function (_a) {
            var req = _a.req;
            return req.user.role === "admin";
        },
        delete: function (_a) {
            var req = _a.req;
            return req.user.role === "admin";
        },
        create: function (_a) {
            var req = _a.req;
            return req.user.role === "admin";
        },
    },
    fields: [
        {
            name: "_isPaid",
            type: "checkbox",
            //making sure users can't set their own products as paid
            access: {
                read: function (_a) {
                    var req = _a.req;
                    return req.user.role === "admin";
                },
                create: function () { return false; }, //can only be created programmatically.
                update: function () { return false; },
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
