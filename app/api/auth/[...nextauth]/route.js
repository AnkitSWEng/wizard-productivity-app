// /app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user }) {
      console.log("SIGNIN CALLBACK HIT", user.email);

      try {
        await connectDB();
        console.log("DB CONNECTED");

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
          console.log("USER CREATED");
        } else {
          console.log("USER EXISTS");
        }

        return true;
      } catch (err) {
        console.error("ERROR IN SIGNIN:", err);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };