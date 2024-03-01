import { z } from "zod";

//We will use this validations both for client and server side

export const AuthCredentialsValidator = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be 8 characters long." }),
});

//getting typescript type from zod schema for useForm types
export type TAuthCredentialsValidator = z.infer<
  typeof AuthCredentialsValidator
>;
