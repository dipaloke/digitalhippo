"use client";
import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/trpc/client";
import {
  AuthCredentialsValidator,
  TAuthCredentialsValidator,
} from "@/lib/validators/account-credentials-validator";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const SignInPage = () => {
  //We are going to pass the state Weather a user is  seller or not as an URL query into this component.
  //thats why we need to receive it whenever the page is loaded.

  const searchParams = useSearchParams();
  const router = useRouter();
  const isSeller = searchParams.get("as") === "seller"; //(ex. /sign-in?as=seller)

  // origin is necessary when we want to redirect ex. from card page to sign-in page. (if authentication fails for a user)
  //& redirect back where they were after signing in.
  const origin = searchParams.get("origin");

  //we are getting the state(if user is seller) from url. so changing the url should let us continue as a seller.
  const continueAsSeller = () => {
    router.push("?as=seller");
  };

  const continueAsBuyer = () => {
    router.replace("sign-in", undefined); //returning back to default(undefined) or as buyer
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    //makes the register function & fromSubmit fully type safe
    //resolver takes validation schema
    resolver: zodResolver(AuthCredentialsValidator),
  });

  //create user to see valid credentials. useMutation used for create,delete etc. except read operation
  //isPending is as same as isLoading state
  const { mutate: signIn, isPending } = trpc.auth.signIn.useMutation({
    onSuccess: () => {
      toast.success("Signed in successfully");
      router.refresh(); //to refresh the page after sign in

      //if people are redirected from a certain page return there after sign in
      if (origin) {
        router.push(`/${origin}`);
        return;
      }

      //if user is a seller then redirect to seller dashboard to list products
      if (isSeller) {
        router.push("/sell");
        return;
      }

      //if none of this cases are true redirect to homepage
      router.push("/");
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") {
        toast.error("Invalid email or password");
      }
    },
  });

  const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
    //send data to server
    signIn({ email, password });
  };

  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0 ">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Icons.logo className="h-20 w-20" />
            <h1 className="text-2xl font-bold">
              Sign in to your {isSeller ? "seller" : ""} account
            </h1>
            <Link
              className={buttonVariants({
                variant: "link",
                className: "gap-1.5",
              })}
              href="/sign-up"
            >
              Don&apos;t have an account? Sign-Up Now.
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Sign-up form */}
          <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <div className="grid gap-1 py-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    // spreading register from useForm & type is safe
                    {...register("email")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.email,
                    })}
                    placeholder="you@example.com"
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                {/* password field */}
                <div className="grid gap-1 py-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...register("password")}
                    type="password"
                    className={cn({
                      "focus-visible:ring-red-500": errors.password,
                    })}
                    placeholder="Password"
                  />
                  {errors?.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button>Sign in</Button>
              </div>
            </form>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center"
              >
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            {isSeller ? (
              <Button
                onClick={continueAsBuyer}
                variant="secondary"
                disabled={isPending}
              >
                Continue as customer
              </Button>
            ) : (
              <Button
                onClick={continueAsSeller}
                variant="secondary"
                disabled={isPending}
              >
                Continue as seller
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
