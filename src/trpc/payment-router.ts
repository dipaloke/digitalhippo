import { z } from "zod";
import { privateProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { getPayloadClient } from "../get-payload";
import { stripe } from "../lib/stripe";
import type Stripe from "stripe";

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      let { productIds } = input;

      if (productIds.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      //get the actual product from provided ids
      const payload = await getPayloadClient();

      //get stripe ids attached to each product to create secure session
      const { docs: products } = await payload.find({
        collection: "products",
        where: {
          id: {
            in: productIds,
          },
        },
      });

      //filtering products by priceId
      const filteredProducts = products.filter((prod) => Boolean(prod.priceId));

      //creating order
      const order = await payload.create({
        collection: "orders",
        data: {
          _isPaid: false, //default value
          products: filteredProducts.map((prod) => prod.id), //only need the ids not entire product
          user: user.id,
        },
      });

      //actual product array that user is buying. going to push transaction fee
      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      //product price
      filteredProducts.forEach((product) => {
        line_items.push({
          price: product.priceId!,
          quantity: 1,
        });
      });
      //transaction fee
      line_items.push({
        price: "price_1OySsaFcahzZSU3Togcb31Jc", //transaction fee ($1) from stripe dashboard create product.
        quantity: 1,
        adjustable_quantity: {
          enabled: false,
        },
      });

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`, //where people will be redirected after payment process.
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`, //redirect to cart if user cancels
          payment_method_types: ["card", "wechat_pay", "link"],
          payment_method_options: {
            wechat_pay: {
              client: "web",
            },
          },
          mode: "payment",
          metadata: {
            //necessary for webhook. to know who paid and for what product order(order id).
            userId: user.id, //who checkedOut.
            orderId: order.id,
          },
          line_items, //the actual product that user is buying
        });
        return { url: stripeSession.url };
      } catch (error) {
        return { url: null };
      }
    }),

  //New API route for payment status Poll:
  pollOrderStatus: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input;
      const payload = await getPayloadClient();

      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          id: {
            equals: orderId,
          },
        },
      });
      if (!orders.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const [order] = orders;

      return { isPaid: order._isPaid };
    }),
});
