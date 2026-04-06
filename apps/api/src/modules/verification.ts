import { FastifyInstance } from "fastify";
import { z } from "zod";
import crypto from "crypto";

const VERIFICATION_CODE_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 10;
const SMS_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

interface SMSProvider {
  send(phone: string, message: string): Promise<boolean>;
}

interface EmailProvider {
  send(email: string, subject: string, html: string): Promise<boolean>;
}

// Mock providers - replace with actual implementations
const mockSMSProvider: SMSProvider = {
  async send(phone: string, message: string): Promise<boolean> {
    console.log(`[SMS] Sending to ${phone}: ${message}`);
    // In production: integrate with Twilio, Vonage, etc.
    return true;
  },
};

const mockEmailProvider: EmailProvider = {
  async send(email: string, subject: string, html: string): Promise<boolean> {
    console.log(`[EMAIL] Sending to ${email}: ${subject}`);
    // In production: integrate with SendGrid, AWS SES, etc.
    return true;
  },
};

function generateCode(): string {
  return crypto
    .randomInt(0, 999999)
    .toString()
    .padStart(VERIFICATION_CODE_LENGTH, "0");
}

function generatePhoneVerificationHash(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function verificationModule(app: FastifyInstance) {
  // Send verification code (email or SMS)
  app.post("/send-code", async (request, reply) => {
    const { userId, method } = request.body as {
      userId: string;
      method: "email" | "sms";
    };

    const user = await app.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: "User not found",
      });
    }

    const code = generateCode();
    const expiresAt = new Date(
      Date.now() +
        (method === "sms" ? SMS_EXPIRY_MINUTES : CODE_EXPIRY_MINUTES) *
          60 *
          1000,
    );

    // Create verification code record
    await app.prisma.verificationCode.create({
      data: {
        userId,
        code,
        type: method === "email" ? "email_verification" : "phone_verification",
        expiresAt,
      },
    });

    try {
      if (method === "sms" && user.phone) {
        await mockSMSProvider.send(
          user.phone,
          `OrbiTalk: Your verification code is ${code}. Valid for ${SMS_EXPIRY_MINUTES} minutes.`,
        );
      } else {
        await mockEmailProvider.send(
          user.email,
          "OrbiTalk - Email Verification",
          `
          <h1>Verify your email</h1>
          <p>Your verification code is:</p>
          <h2 style="font-size: 32px; letter-spacing: 8px;">${code}</h2>
          <p>This code expires in ${CODE_EXPIRY_MINUTES} minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          `,
        );
      }

      return reply.send({
        success: true,
        message: `Verification code sent via ${method}`,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: `Failed to send verification code via ${method}`,
      });
    }
  });

  // Verify code
  app.post("/verify-code", async (request, reply) => {
    const { userId, code, type } = request.body as {
      userId: string;
      code: string;
      type: "email_verification" | "phone_verification" | "password_reset";
    };

    const verificationRecord = await app.prisma.verificationCode.findFirst({
      where: {
        userId,
        code,
        type,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verificationRecord) {
      return reply.status(400).send({
        success: false,
        error: "Invalid or expired verification code",
      });
    }

    if (verificationRecord.attempts >= MAX_ATTEMPTS) {
      await app.prisma.verificationCode.update({
        where: { id: verificationRecord.id },
        data: { expiresAt: new Date() },
      });

      return reply.status(400).send({
        success: false,
        error: "Too many attempts. Please request a new code.",
      });
    }

    // Increment attempts
    await app.prisma.verificationCode.update({
      where: { id: verificationRecord.id },
      data: {
        verified: true,
        attempts: { increment: 1 },
      },
    });

    // Update user verification status
    if (type === "phone_verification") {
      await app.prisma.user.update({
        where: { id: userId },
        data: { phoneVerified: true },
      });
    } else if (type === "email_verification") {
      // Email is verified when user clicks the link
    }

    await app.prisma.auditLog.create({
      data: {
        userId,
        action: "CODE_VERIFIED",
        entityType: "VerificationCode",
        entityId: verificationRecord.id,
        metadata: { type },
      },
    });

    return reply.send({
      success: true,
      message: "Code verified successfully",
    });
  });

  // Register with phone verification
  app.post("/register", async (request, reply) => {
    const schema = z.object({
      email: z.string().email(),
      phone: z.string().min(10).max(20).optional(),
      password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/),
      name: z.string().min(1).max(100),
      nickname: z.string().min(2).max(20),
      tag: z.string().min(1).max(4).toUpperCase(),
      birthDate: z.string().refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 18;
        },
        { message: "Must be 18+" },
      ),
      country: z.string().min(2),
      countryCode: z.string().length(2),
      state: z.string().optional(),
      city: z.string().optional(),
      verificationMethod: z.enum(["email", "sms"]),
    });

    const body = schema.parse(request.body);

    // Check email exists
    const existingEmail = await app.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingEmail) {
      return reply.status(400).send({
        success: false,
        error: "Email already registered",
      });
    }

    // Check phone exists (if provided)
    if (body.phone) {
      const existingPhone = await app.prisma.user.findUnique({
        where: { phone: body.phone },
      });

      if (existingPhone) {
        return reply.status(400).send({
          success: false,
          error: "Phone number already registered",
        });
      }
    }

    // Check nickname#tag exists
    const existingNickname = await app.prisma.user.findFirst({
      where: { nickname: body.nickname, tag: body.tag },
    });

    if (existingNickname) {
      return reply.status(400).send({
        success: false,
        error: "This nickname#tag is already taken",
      });
    }

    // Hash password
    const bcrypt = await import("argon2");
    const passwordHash = await bcrypt.hash(body.password);

    // Calculate zodiac sign
    const birthDate = new Date(body.birthDate);
    const zodiacSign = calculateZodiacSign(
      birthDate.getDate(),
      birthDate.getMonth() + 1,
    );

    // Create user (pending verification)
    const user = await app.prisma.user.create({
      data: {
        email: body.email,
        phone: body.phone,
        passwordHash,
        name: body.name,
        nickname: body.nickname,
        tag: body.tag,
        birthDate,
        zodiacSign,
        country: body.country,
        countryCode: body.countryCode,
        state: body.state,
        city: body.city,
        verificationMethod: body.verificationMethod,
        verificationStatus: "PENDING",
        gender: "PREFER_NOT_TO_ANSWER",
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        nickname: true,
        tag: true,
        verificationMethod: true,
        createdAt: true,
      },
    });

    // Send verification code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await app.prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        type: "email_verification",
        expiresAt,
      },
    });

    // Send verification via chosen method
    if (body.verificationMethod === "sms" && body.phone) {
      await mockSMSProvider.send(
        body.phone,
        `OrbiTalk: Welcome! Your verification code is ${code}. Valid for ${CODE_EXPIRY_MINUTES} minutes.`,
      );
    } else {
      await mockEmailProvider.send(
        body.email,
        "Welcome to OrbiTalk - Verify your email",
        `
        <h1>Welcome to OrbiTalk!</h1>
        <p>Hi ${body.name},</p>
        <p>Thank you for joining OrbiTalk. Please verify your email with this code:</p>
        <h2 style="font-size: 32px; letter-spacing: 8px;">${code}</h2>
        <p>This code expires in ${CODE_EXPIRY_MINUTES} minutes.</p>
        `,
      );
    }

    // Create audit log
    await app.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        entityType: "User",
        entityId: user.id,
        metadata: {
          email: user.email,
          country: body.countryCode,
          verificationMethod: body.verificationMethod,
        },
        ipAddress: request.ip,
      },
    });

    return reply.status(201).send({
      success: true,
      data: {
        userId: user.id,
        verificationMethod: body.verificationMethod,
        message: "Registration successful. Please verify your account.",
      },
    });
  });

  // Resend verification code
  app.post("/resend-code", async (request, reply) => {
    const { userId } = request.body as { userId: string };

    const user = await app.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: "User not found",
      });
    }

    const method = user.verificationMethod || "email";
    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await app.prisma.verificationCode.create({
      data: {
        userId,
        code,
        type: "email_verification",
        expiresAt,
      },
    });

    if (method === "sms" && user.phone) {
      await mockSMSProvider.send(
        user.phone,
        `OrbiTalk: Your new verification code is ${code}. Valid for ${CODE_EXPIRY_MINUTES} minutes.`,
      );
    } else {
      await mockEmailProvider.send(
        user.email,
        "OrbiTalk - New Verification Code",
        `
        <h1>New Verification Code</h1>
        <p>Your new verification code is:</p>
        <h2 style="font-size: 32px; letter-spacing: 8px;">${code}</h2>
        <p>This code expires in ${CODE_EXPIRY_MINUTES} minutes.</p>
        `,
      );
    }

    return reply.send({
      success: true,
      message: `Verification code sent via ${method}`,
    });
  });

  // Complete verification
  app.post("/complete-verification", async (request, reply) => {
    const { userId, code } = request.body as { userId: string; code: string };

    const verificationRecord = await app.prisma.verificationCode.findFirst({
      where: {
        userId,
        code,
        type: "email_verification",
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verificationRecord) {
      return reply.status(400).send({
        success: false,
        error: "Invalid or expired verification code",
      });
    }

    // Mark as verified
    await app.prisma.verificationCode.update({
      where: { id: verificationRecord.id },
      data: { verified: true },
    });

    // Update user status
    await app.prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: "APPROVED" },
    });

    return reply.send({
      success: true,
      message: "Account verified successfully!",
    });
  });
}

function calculateZodiacSign(day: number, month: number): string {
  const signs = [
    { name: "aries", end: { day: 19, month: 3 } },
    { name: "taurus", end: { day: 20, month: 4 } },
    { name: "gemini", end: { day: 20, month: 5 } },
    { name: "cancer", end: { day: 22, month: 6 } },
    { name: "leo", end: { day: 22, month: 7 } },
    { name: "virgo", end: { day: 22, month: 8 } },
    { name: "libra", end: { day: 22, month: 9 } },
    { name: "scorpio", end: { day: 21, month: 10 } },
    { name: "sagittarius", end: { day: 21, month: 11 } },
    { name: "capricorn", end: { day: 19, month: 0 } },
    { name: "aquarius", end: { day: 18, month: 1 } },
    { name: "pisces", end: { day: 20, month: 2 } },
  ];

  for (const sign of signs) {
    if (
      month < sign.end.month ||
      (month === sign.end.month && day <= sign.end.day)
    ) {
      return sign.name;
    }
  }
  return "capricorn";
}
