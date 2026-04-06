import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import { PrismaClient } from "@prisma/client";
import { authModule } from "./modules/auth";
import { postsModule } from "./modules/posts";
import { discoveryModule } from "./modules/discovery";
import { verificationModule } from "./modules/verification";
import { consentModule } from "./modules/consent";
import { moderationModule } from "./modules/moderation";
import { translationModule } from "./modules/translation";
import { languageAIModule } from "./modules/language-ai";
import { aiModerationModule } from "./modules/ai-moderation";
import { aiProfileModule } from "./modules/ai-profile";
import { identityVerificationModule } from "./modules/identity-verification";
import { companionModule } from "./modules/companion";
import { compatibilityModule } from "./modules/compatibility";
import { reportsModule } from "./modules/reports";

export const prisma = new PrismaClient();

const buildApp = async () => {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
    },
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || "development-secret-change-in-production",
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    },
  });

  await app.register(sensible);

  app.decorate("prisma", prisma);

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: "Validation Error",
        details: error.validation,
      });
    }

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      error: "Internal Server Error",
    });
  });

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  await app.register(authModule, { prefix: "/api/auth" });
  await app.register(postsModule, { prefix: "/api/posts" });
  await app.register(discoveryModule, { prefix: "/api/discovery" });
  await app.register(verificationModule, { prefix: "/api/verification" });
  await app.register(consentModule, { prefix: "/api/consent" });
  await app.register(moderationModule, { prefix: "/api/moderation" });
  await app.register(aiModerationModule, { prefix: "/api/ai-moderation" });
  await app.register(translationModule, { prefix: "/api/translation" });
  await app.register(languageAIModule, { prefix: "/api/ai" });
  await app.register(aiProfileModule, { prefix: "/api/ai" });
  await app.register(identityVerificationModule);
  await app.register(companionModule, { prefix: "/api/companion" });
  await app.register(compatibilityModule, { prefix: "/api/compatibility" });
  await app.register(reportsModule, { prefix: "/api/reports" });

  return app;
};

const start = async () => {
  try {
    const app = await buildApp();

    await app.listen({
      port: parseInt(process.env.PORT || "3001"),
      host: "0.0.0.0",
    });

    console.log(`🚀 Server running at http://localhost:3001`);
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

start();

export { buildApp };
