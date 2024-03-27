import { PRODUCT_CATAGORIES } from "@/config";
import { getPayloadClient } from "@/get-payload";
import { getServerSideUser } from "@/lib/payload-utils";
import { formatPrice } from "@/lib/utils";
import { Product, ProductFile, User } from "@/payload-types";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PaymentStatus from "../../components/PaymentStatus";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}
const thankYouPage = async ({ searchParams }: PageProps) => {
  const orderId = searchParams.orderId;
  const nextCookies = cookies();

  //this page needs tobe protected. So only authorized users can access ans download.
  //first get the user from cookies.
  const { user } = await getServerSideUser(nextCookies);

  //getting the actual order that the page is for
  const payload = await getPayloadClient();

  const { docs: orders } = await payload.find({
    collection: "orders",
    depth: 2, //gets the whole order obj not just id
    where: {
      id: {
        equals: orderId,
      },
    },
  });

  const [order] = orders;

  //wrong orderId in searchparams
  if (!order) return notFound();

  //check if it is the same user who bought the product & trying to access it.

  //id of the user that made the order
  const orderUserId =
    typeof order.user === "string" ? order.user : order.user.id;

  //if not logged in
  if (orderUserId !== user?.id) {
    return redirect(`/sign-in?origin=thank-you?orderId=${order.id}`);
  }

  //total price
  const products = order.products as Product[];
  const orderTotal = products.reduce((total, product) => {
    return total + product.price;
  }, 0);

  return (
    <main className="relative lg:min-h-full">
      <div className="hidden lg:block h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
        <Image
          fill
          src="/checkout-thank-you.jpg"
          alt="thank you image"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
          <div className="lg:col-start-2 ">
            <p className="text-sm font-medium text-blue-600">
              Order successful
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Thanks for ordering
            </h1>

            {/* if payment is successful. */}
            {order._isPaid ? (
              <p className="mt-2 text-base text-muted-foreground">
                Your order was processed and your assets are available to
                download below. We&apos;ve sent your receipt & order details to{" "}
                {typeof order.user !== "string" ? (
                  <span className="font-medium text-gray-900">
                    {order.user.email}
                  </span>
                ) : null}
                .
              </p>
            ) : (
              <p className="mt-2 text-base text-muted-foreground">
                We appreciate your order, & we&apos;re currently processing it.
                So hang tight and we&apos;ll send you confirmation very soon!
              </p>
            )}
            <div className="mt-16 text-sm font-medium">
              <div className="text-muted-foreground">Order nr.</div>
              <div className=" mt-2 text-gray-900">{order.id}</div>
              {/* listing the products */}
              <ul className="mt-6 divide-y divide-gray-400 border-t border-gray-200 text-sm font-medium text-muted-foreground">
                {(order.products as Product[]).map((product) => {
                  const label = PRODUCT_CATAGORIES.find(
                    ({ value }) => value === product.category
                  )?.label;
                  //download URL: where do we download the url
                  const downloadUrl = (product.product_files as ProductFile)
                    .url as string;
                  //img of product
                  const { image } = product.images[0];
                  return (
                    <li className="flex space-x-6 py-6" key={product.id}>
                      <div className="relative h-24 w-24">
                        {typeof image !== "string" && image.url ? (
                          <Image
                            fill
                            src={image.url}
                            alt={`${product.name} image`}
                            className="flex-none rounded-md bg-gray-100 object-cover object-center"
                          />
                        ) : null}
                      </div>

                      <div className="flex-auto flex flex-col justify-between">
                        <div className=" space-y-1">
                          <h3 className=" text-gray-900">{product.name}</h3>
                          <p className="my-1">Category: {label}</p>
                        </div>
                        {/* download button */}
                        {order._isPaid ? (
                          <a
                            href={downloadUrl}
                            download={product.name}
                            className=" text-blue-600 hover:underline underline-offset-2"
                          >
                            Download asset
                          </a>
                        ) : null}
                      </div>
                      <p className=" flex-none font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <div className=" space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-muted-foreground">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p className=" text-gray-900">{formatPrice(orderTotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Transaction fee</p>
                  <p className=" text-gray-900">{formatPrice(1)}</p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                  <p className=" text-base">Total</p>
                  <p className="text-base text-gray-900">
                    {formatPrice(orderTotal + 1)}
                  </p>
                </div>
              </div>
              <PaymentStatus
                isPaid={order._isPaid}
                orderEmail={(order.user as User).email}
                orderId={order.id}
              />

              <div className="mt-16 border-t border-gray-200 py-6 text-right">
                <Link
                  href="/products"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Continue shopping &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default thankYouPage;
