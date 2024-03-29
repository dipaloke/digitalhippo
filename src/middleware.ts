import { NextRequest, NextResponse } from "next/server";
import { getServerSideUser } from "./lib/payload-utils";

export async function middleware(req: NextRequest) {
  //if user is logged in then user cant access sign-in page and sign-up page
  const { nextUrl, cookies } = req;
  const { user } = await getServerSideUser(cookies);

  if (user && ["/sign-in", "/sign-up"].includes(nextUrl.pathname)) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/`);
  }

  //if not logged in let the user do the next thing.
  return NextResponse.next();
}
