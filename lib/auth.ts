import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { UserRole } from "@/types/next-auth";

const primarySecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: primarySecret,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token }) {
      if (!token.role) {
        token.role =
          token.email && token.email.toLowerCase() === "m.hasan142121@gmail.com"
            ? "admin"
            : "manager";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const role = token.role as UserRole | undefined;
        session.user.role = role;
      }
      return session;
    },
  },
});
