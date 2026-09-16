import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/username";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      id: "username-password",
      name: "Username & Password",
      credentials: {
        username: { label: "Username / Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const rawIdentifier = (credentials?.username as string)?.trim();
        const rawPassword = (credentials?.password as string) || "";

        if (!rawIdentifier || !rawPassword) {
          return null;
        }

        const isEmail = rawIdentifier.includes("@");
        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: rawIdentifier.toLowerCase() }
            : { username: rawIdentifier.toLowerCase() },
        });

        if (!user) {
          return null;
        }

        if (user.status === "SUSPENDED") {
          throw new Error("AccountSuspended");
        }

        if (!user.password) {
          // User exists (e.g. from Google or Email OTP) but has not set a password yet
          throw new Error("PasswordNotSet");
        }

        const isValid = await bcrypt.compare(rawPassword, user.password);
        if (!isValid) {
          return null;
        }

        return user;
      },
    }),
    Credentials({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const rawEmail = (credentials?.email as string)?.toLowerCase().trim();
        const rawCode = (credentials?.code as string)?.trim();

        if (!rawEmail || !rawCode) {
          return null;
        }

        // Verify OTP against VerificationToken table
        const verification = await prisma.verificationToken.findFirst({
          where: {
            identifier: rawEmail,
            token: rawCode,
            expires: { gt: new Date() },
          },
        });

        if (!verification) {
          throw new Error("InvalidOrExpiredCode");
        }

        // Delete used token to prevent replay
        await prisma.verificationToken.deleteMany({
          where: { identifier: rawEmail },
        });

        let user = await prisma.user.findUnique({
          where: { email: rawEmail },
        });

        if (user && user.status === "SUSPENDED") {
          throw new Error("AccountSuspended");
        }

        const isSuperAdminEmail =
          rawEmail === "admin@ravenlink.app" ||
          (process.env.SUPER_ADMIN_EMAIL && rawEmail === process.env.SUPER_ADMIN_EMAIL.toLowerCase().trim());

        if (!user) {
          const baseName = rawEmail.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "");
          const uniqueUsername = await generateUniqueUsername(baseName || "user");
          user = await prisma.user.create({
            data: {
              email: rawEmail,
              name: baseName || "Creator",
              username: uniqueUsername,
              emailVerified: new Date(),
              role: isSuperAdminEmail ? "SUPER_ADMIN" : "USER",
              status: "ACTIVE",
              bio: "Creative Creator on Ravenlink.",
              themeBackground: "#FFF8E7",
              themeAccent: "#3772FF",
              themeTextColor: "#0D0D0D",
              themeButtonColor: "#FFDE59",
              themeButtonTextColor: "#0D0D0D",
              themeCardStyle: "brutal-solid",
              themeFont: "space-grotesk",
            },
          });

          const { recordActivityLog } = await import("@/lib/activity");
          await recordActivityLog({
            type: "USER_REGISTERED",
            title: `Kreator Baru Bergabung: @${uniqueUsername}`,
            subtitle: `${baseName || "Akun Baru"} • Registrasi via Email OTP`,
            actorId: user.id,
            actorName: uniqueUsername,
            targetId: user.id,
            targetName: uniqueUsername,
            metadata: { email: rawEmail, username: uniqueUsername, method: "OTP" },
          });
        } else {
          // Update emailVerified if not verified yet
          if (!user.emailVerified) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() },
            });
          }
          if (isSuperAdminEmail && user.role !== "SUPER_ADMIN") {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { role: "SUPER_ADMIN" },
            });
          }
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, status: true },
        });

        if (dbUser?.status === "SUSPENDED") {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        let dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            image: true,
            role: true,
            status: true,
            themeBackground: true,
            themeAccent: true,
          },
        });

        // Cek status kepemilikan Super Admin berdasarkan email
        const isSuperAdminEmail =
          dbUser?.email === "admin@ravenlink.app" ||
          (process.env.SUPER_ADMIN_EMAIL &&
            dbUser?.email &&
            dbUser.email.toLowerCase().trim() === process.env.SUPER_ADMIN_EMAIL.toLowerCase().trim());

        // Jika akun baru (misal via Google) belum memiliki username, generate username unik otomatis
        if (dbUser && !dbUser.username) {
          const baseName = dbUser.name || dbUser.email?.split("@")[0] || "creator";
          const uniqueUsername = await generateUniqueUsername(baseName);
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              username: uniqueUsername,
              role: isSuperAdminEmail ? "SUPER_ADMIN" : dbUser.role,
            },
            select: {
              id: true,
              email: true,
              username: true,
              name: true,
              image: true,
              role: true,
              status: true,
              themeBackground: true,
              themeAccent: true,
            },
          });

          const { recordActivityLog } = await import("@/lib/activity");
          await recordActivityLog({
            type: "USER_REGISTERED",
            title: `Kreator Baru Bergabung: @${uniqueUsername}`,
            subtitle: `${dbUser.name || "Akun Baru"} • Registrasi via Google`,
            actorId: dbUser.id,
            actorName: uniqueUsername,
            targetId: dbUser.id,
            targetName: uniqueUsername,
            metadata: { email: dbUser.email, username: uniqueUsername, method: "GOOGLE" },
          });
        } else if (dbUser && isSuperAdminEmail && dbUser.role !== "SUPER_ADMIN") {
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: { role: "SUPER_ADMIN" },
            select: {
              id: true,
              email: true,
              username: true,
              name: true,
              image: true,
              role: true,
              status: true,
              themeBackground: true,
              themeAccent: true,
            },
          });
        }

        if (dbUser) {
          token.username = dbUser.username;
          if (dbUser.name) token.name = dbUser.name;
          if (dbUser.image) token.picture = dbUser.image;
          token.role = dbUser.role || "USER";
          token.status = dbUser.status || "ACTIVE";
          token.themeBackground = dbUser.themeBackground;
          token.themeAccent = dbUser.themeAccent;
        }
      }

      // Handle session update on client (e.g. updating username or profile)
      if (trigger === "update") {
        if (token.sub) {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: {
              username: true,
              name: true,
              image: true,
              role: true,
              status: true,
              themeBackground: true,
              themeAccent: true,
            },
          });
          if (freshUser) {
            token.username = freshUser.username;
            token.name = freshUser.name;
            token.picture = freshUser.image;
            token.role = freshUser.role || "USER";
            token.status = freshUser.status || "ACTIVE";
            token.themeBackground = freshUser.themeBackground;
            token.themeAccent = freshUser.themeAccent;
          }
        }
        if (session) {
          const updatedUser = (session as { user?: Record<string, unknown> }).user || session;
          if (updatedUser.username !== undefined) token.username = updatedUser.username as string;
          if (updatedUser.name !== undefined) token.name = updatedUser.name as string;
          if (updatedUser.image !== undefined) token.picture = updatedUser.image as string;
          if (updatedUser.role !== undefined) token.role = updatedUser.role as string;
          if (updatedUser.status !== undefined) token.status = updatedUser.status as string;
          if (updatedUser.themeBackground !== undefined) token.themeBackground = updatedUser.themeBackground as string;
          if (updatedUser.themeAccent !== undefined) token.themeAccent = updatedUser.themeAccent as string;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.username = (token.username as string) || null;
        if (token.name) session.user.name = token.name as string;
        if (token.picture) session.user.image = token.picture as string;
        session.user.role = (token.role as string) || "USER";
        session.user.status = (token.status as string) || "ACTIVE";
        session.user.themeBackground = (token.themeBackground as string) || "#FFF8E7";
        session.user.themeAccent = (token.themeAccent as string) || "#3772FF";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
