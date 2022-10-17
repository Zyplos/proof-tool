import NextAuth from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { mongoClientPromise } from "../../../database/mongodb";
import GoogleProvider from "next-auth/providers/google";

// console.log(mongoClientPromise);

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  theme: {
    colorScheme: "dark",
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.admin = user.admin;

      // console.log("====NEXTAUTHCALLBACKSESSION", session, user);

      return session;
    },
    async signIn({ account, profile }) {
      console.log("NEXTAUTH signin callback", account, profile);
      if (account.provider === "google" && profile.email_verified) {
        if (profile.email.endsWith("@uic.edu")) {
          return true;
        } else {
          return "/signin-error";
        }
      }
      return "/signin-error"; // Do different verification for other providers that don't have `email_verified`
    },
  },
  adapter: MongoDBAdapter(mongoClientPromise),
};

export default NextAuth(authOptions);
