import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { User } from "../models";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "email@email.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials:any ) {
        if (!credentials.email || !credentials.password) {
          return null;
        }
        const user = await User.findOne({
          where: { email: credentials.email, isEmailConfirmed: true },
        });

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          };
        } else {
          return null;
        }
      },
    }),
  ],
};
export { authOptions };

export default authOptions;
