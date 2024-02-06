import Link from "next/link";
import MaxWithWrapper from "./MaxWithWrapper";
import { Icons } from "./Icons";
import NavItems from "./NavItems";
import { buttonVariants } from "./ui/button";

const Navbar = () => {
  //mock data
  const user = null;

  return (
    <div className="bg-white sticky z-50 top-0 inset-x-0 h-16">
      <header className="relative bg-white">
        <MaxWithWrapper>
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              {/* TODO: Mobile nav */}
              <div className="ml-4 flex lg:ml-0">
                <Link href="/">
                  {/* icons props are necessary to give icons classnames */}
                  <Icons.logo className="h-10 w-10" />
                </Link>
              </div>
              {/* Nav items. hidden in small devices */}
              <div className="hidden z-50 lg:ml-8 lg:block lg:self-stretch ">
                <NavItems />
              </div>

              {/* Right side of navbar */}
              <div className="ml-auto flex items-center">
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                  {user ? null : (
                    <Link
                      href="/sign-in"
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      Sign in
                    </Link>
                  )}
                  {user ? null : (
                    <span className="h-6 w-px bg-gray-200" area-hidden="true" />
                  )}
                  {/* //TODO: Dropdown user options instead of p tag*/}
                  {user ? (
                    <p></p>
                  ) : (
                    <Link
                      href="/sign-up"
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      Create account
                    </Link>
                  )}
                  {user ? (
                    <span className="h-6 w-px bg-gray-200" area-hidden="true" />
                  ) : null}
                  {user ? null : (
                    <div className=" flex lg:ml-6">
                      <span
                        className="h-6 w-px bg-gray-200"
                        area-hidden="true"
                      />
                    </div>
                  )}
                  <div className="ml-4 flow-root lg:ml-6">
                    <Cart />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MaxWithWrapper>
      </header>
    </div>
  );
};

export default Navbar;
