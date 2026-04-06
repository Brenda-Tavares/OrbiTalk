import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import argon2 from "argon2";
import * as OTPAuth from "otplib";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../app.js";

// Simple validation schemas (inline to avoid import issues)
const EmailSchema = z.string().email();
const PasswordSchema = z
  .string()
  .min(8)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/);
const BirthDateSchema = z.string().refine(
  (date) => {
    const birth = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()))
      age--;
    return age >= 18;
  },
  { message: "Must be 18 years or older" },
);

function getZodiacSign(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return "Aquarius";
  return "Pisces";
}

const registerSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: z.string().min(1).max(100),
  nickname: z.string().min(2).max(20),
  tag: z.string().min(1).max(4).toUpperCase(),
  birthDate: BirthDateSchema,
});

const loginSchema = z.object({
  email: EmailSchema,
  password: z.string(),
});

export async function authModule(app: FastifyInstance) {
  // Register
  app.post(
    "/register",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = registerSchema.parse(request.body);

      // Check if email exists
      const existingEmail = await app.prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingEmail) {
        return reply.status(400).send({
          success: false,
          error: "Email already registered",
        });
      }

      // Check if nickname#tag exists
      const existingNickname = await app.prisma.user.findFirst({
        where: {
          nickname: body.nickname,
          tag: body.tag,
        },
      });

      if (existingNickname) {
        return reply.status(400).send({
          success: false,
          error: "This nickname#tag is already taken",
        });
      }

      // Hash password
      const passwordHash = await argon2.hash(body.password);

      // Calculate zodiac sign from birth date
      const birthDate = new Date(body.birthDate);
      const zodiacSign = getZodiacSign(body.birthDate);

      // Create user (verification pending)
      const user = await app.prisma.user.create({
        data: {
          email: body.email,
          passwordHash,
          name: body.name,
          nickname: body.nickname,
          tag: body.tag,
          birthDate,
          zodiacSign,
          verificationStatus: "PENDING",
          country: "BR",
          countryCode: "55",
          gender: "PREFER_NOT_TO_ANSWER",
        },
        select: {
          id: true,
          email: true,
          name: true,
          nickname: true,
          tag: true,
          verificationStatus: true,
          createdAt: true,
        },
      });

      // Create audit log
      await app.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_REGISTERED",
          entityType: "User",
          entityId: user.id,
          metadata: { email: user.email },
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        },
      });

      return reply.status(201).send({
        success: true,
        data: {
          ...user,
          fullHandle: `${user.nickname}#${user.tag}`,
        },
        message:
          "Registration successful. Please complete identity verification.",
      });
    },
  );

  // Login
  app.post("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginSchema.parse(request.body);

    const user = await app.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user || !user.passwordHash) {
      return reply.status(401).send({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return partial auth, require 2FA code
      const tempToken = app.jwt.sign(
        { userId: user.id, temp: true },
        { expiresIn: "5m" },
      );

      return reply.send({
        success: true,
        requiresTwoFactor: true,
        tempToken,
      });
    }

    // Verify password
    const validPassword = await argon2.verify(user.passwordHash, body.password);

    if (!validPassword) {
      // Log failed attempt
      await app.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN_FAILED",
          entityType: "User",
          entityId: user.id,
          metadata: { reason: "Invalid password" },
          ipAddress: request.ip,
        },
      });

      return reply.status(401).send({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate tokens
    const accessToken = app.jwt.sign({ userId: user.id });
    const refreshToken = app.jwt.sign(
      { userId: user.id, type: "refresh" },
      { expiresIn: "7d" },
    );

    // Create session
    await app.prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        deviceInfo: request.headers["user-agent"],
        ipAddress: request.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Log successful login
    await app.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_SUCCESS",
        entityType: "User",
        entityId: user.id,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      },
    });

    // Update last seen
    await app.prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });

    return reply.send({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          tag: user.tag,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
      },
    });
  });

  // Refresh token
  app.post("/refresh", async (request: FastifyRequest, reply: FastifyReply) => {
    const { refreshToken } = request.body as { refreshToken?: string };

    if (!refreshToken) {
      return reply.status(400).send({
        success: false,
        error: "Refresh token required",
      });
    }

    try {
      const decoded = app.jwt.verify(refreshToken) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      // Check if session exists and is valid
      const session = await app.prisma.session.findFirst({
        where: {
          token: refreshToken,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        return reply.status(401).send({
          success: false,
          error: "Session expired or invalid",
        });
      }

      // Generate new tokens
      const newAccessToken = app.jwt.sign({ userId: decoded.userId });
      const newRefreshToken = app.jwt.sign(
        { userId: decoded.userId, type: "refresh" },
        { expiresIn: "7d" },
      );

      // Update session
      await app.prisma.session.update({
        where: { id: session.id },
        data: {
          token: newRefreshToken,
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return reply.send({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (err) {
      return reply.status(401).send({
        success: false,
        error: "Invalid or expired refresh token",
      });
    }
  });

  // Verify 2FA code
  app.post(
    "/2fa/verify",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tempToken, code } = request.body as {
        tempToken: string;
        code: string;
      };

      try {
        const decoded = app.jwt.verify(tempToken) as {
          userId: string;
          temp: boolean;
        };

        if (!decoded.temp) {
          throw new Error("Invalid temp token");
        }

        const user = await app.prisma.user.findUnique({
          where: { id: decoded.userId },
        });

        if (!user || !user.twoFactorSecret) {
          return reply.status(400).send({
            success: false,
            error: "2FA not configured",
          });
        }

        // Verify TOTP code
        const isValid = OTPAuth.authenticator.verify({
          token: code,
          secret: user.twoFactorSecret,
        });

        if (!isValid) {
          return reply.status(401).send({
            success: false,
            error: "Invalid 2FA code",
          });
        }

        // Generate tokens
        const accessToken = app.jwt.sign({ userId: user.id });
        const refreshToken = app.jwt.sign(
          { userId: user.id, type: "refresh" },
          { expiresIn: "7d" },
        );

        return reply.send({
          success: true,
          data: {
            accessToken,
            refreshToken,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              nickname: user.nickname,
              tag: user.tag,
              avatar: user.avatar,
              isVerified: user.isVerified,
            },
          },
        });
      } catch (err) {
        return reply.status(401).send({
          success: false,
          error: "Invalid or expired token",
        });
      }
    },
  );

  // Setup 2FA
  app.post(
    "/2fa/setup",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user;

      // Generate secret
      const secret = OTPAuth.authenticator.generateSecret();

      // Generate QR code
      const otpauth = OTPAuth.authenticator.keyuri(
        user.email,
        "OrbiTalk",
        secret,
      );

      const qrCodeUrl = await QRCode.toDataURL(otpauth);

      // Store secret temporarily (needs verification)
      await app.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secret },
      });

      return reply.send({
        success: true,
        data: {
          secret,
          qrCodeUrl,
        },
      });
    },
  );

  // Enable 2FA (after verification)
  app.post(
    "/2fa/enable",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { code } = request.body as { code: string };
      const user = (request as any).user;

      const dbUser = await app.prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!dbUser?.twoFactorSecret) {
        return reply.status(400).send({
          success: false,
          error: "Please setup 2FA first",
        });
      }

      // Verify the code
      const isValid = OTPAuth.authenticator.verify({
        token: code,
        secret: dbUser.twoFactorSecret,
      });

      if (!isValid) {
        return reply.status(401).send({
          success: false,
          error: "Invalid verification code",
        });
      }

      // Enable 2FA
      await app.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true },
      });

      return reply.send({
        success: true,
        message: "2FA enabled successfully",
      });
    },
  );

  // Logout
  app.post("/logout", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    // Invalidate all sessions for this user
    await app.prisma.session.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
    });

    // Create audit log
    await app.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGOUT",
        entityType: "User",
        entityId: user.id,
        ipAddress: request.ip,
      },
    });

    return reply.send({
      success: true,
      message: "Logged out successfully",
    });
  });

  // Delete account
  app.delete(
    "/account",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user;

      // Delete all user data
      await app.prisma.$transaction([
        app.prisma.session.deleteMany({ where: { userId: user.id } }),
        app.prisma.notification.deleteMany({ where: { userId: user.id } }),
        app.prisma.message.deleteMany({ where: { senderId: user.id } }),
        app.prisma.friendRequest.deleteMany({
          where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
        }),
        app.prisma.gamePlayer.deleteMany({ where: { userId: user.id } }),
        app.prisma.userLanguage.deleteMany({ where: { userId: user.id } }),
        app.prisma.user.delete({ where: { id: user.id } }),
      ]);

      return reply.send({
        success: true,
        message: "Account deleted successfully",
      });
    },
  );
}

declare module "fastify" {
  interface FastifyRequest {
    user?: { userId: string };
  }
}

export const authenticate = async (
  app: Fastify,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const decoded = (await request.jwtVerify()) as { userId: string };
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: "Unauthorized",
    });
  }
};
