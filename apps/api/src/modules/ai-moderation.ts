import { FastifyInstance } from "fastify";
import { contentCache, moderationRateLimit, getCacheKey } from "../lib/cache";

interface PerspectiveResult {
  toxicity: number;
  severeToxicity: number;
  identityAttack: number;
  insult: number;
  threat: number;
  sexualExplicit: number;
  flirtation: number;
}

interface ModerationResult {
  isSafe: boolean;
  flags: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  suggestedAction: "allow" | "warn" | "block" | "ban";
  minorDetected: boolean;
  womenTargetingDetected: boolean;
  aiScore: {
    toxicity: number;
    threat: number;
    sexual: number;
    harassment: number;
  };
  confidence: number;
}

const TOXICITY_PATTERNS = [
  /\b(fuck|shit|damn|ass|bitch|whore|slut|idiot|stupid|dumb)\b/gi,
  /\b(kill|die|murder|death|rape|attack|beat|hurt)\b/gi,
  /\b(nude|naked|sex|sexy|erotic|porn|xxx)\b/gi,
];

const MINOR_PATTERNS = [
  /\b(young|kid|teen|child|baby|minor|underage|under 18)\b/gi,
  /\b(teacher|student|school|class)\b.*\b(like|love|want)\b/gi,
];

const WOMEN_TARGETING_PATTERNS = [
  /\b(housewife|home maker|just woman)\b/gi,
  /\b(beautiful|pretty|sexy).*(woman|girl|girlfriend)\b/gi,
  /\b(woman|girl).*(alone|married|single|divorced)\b/gi,
];

async function callGooglePerspectiveAPI(
  text: string,
): Promise<PerspectiveResult | null> {
  const apiKey = process.env.GOOGLE_PERSPECTIVE_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: { text },
          languages: ["en", "pt", "es", "zh", "ko", "ja", "ru"],
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            IDENTITY_ATTACK: {},
            INSULT: {},
            THREAT: {},
            SEXUALLY_EXPLICIT: {},
            FLIRTATION: {},
          },
        }),
      },
    );

    if (!response.ok) {
      console.error("Perspective API error:", await response.text());
      return null;
    }

    const data = await response.json();
    const attributeScores = data.attributeScores;

    return {
      toxicity: attributeScores.TOXICITY?.summaryScore?.value || 0,
      severeToxicity: attributeScores.SEVERE_TOXICITY?.summaryScore?.value || 0,
      identityAttack: attributeScores.IDENTITY_ATTACK?.summaryScore?.value || 0,
      insult: attributeScores.INSULT?.summaryScore?.value || 0,
      threat: attributeScores.THREAT?.summaryScore?.value || 0,
      sexualExplicit:
        attributeScores.SEXUALLY_EXPLICIT?.summaryScore?.value || 0,
      flirtation: attributeScores.FLIRTATION?.summaryScore?.value || 0,
    };
  } catch (error) {
    console.error("Perspective API error:", error);
    return null;
  }
}

function analyzePatterns(text: string): {
  flags: string[];
  minorDetected: boolean;
  womenTargetingDetected: boolean;
  hasToxicity: boolean;
  hasThreat: boolean;
  hasSexual: boolean;
} {
  const flags: string[] = [];
  let minorDetected = false;
  let womenTargetingDetected = false;
  let hasToxicity = false;
  let hasThreat = false;
  let hasSexual = false;

  for (const pattern of TOXICITY_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("potentially_toxic_language");
      hasToxicity = true;
    }
    pattern.lastIndex = 0;
  }

  for (const pattern of MINOR_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("potential_minor_targeting");
      minorDetected = true;
    }
    pattern.lastIndex = 0;
  }

  for (const pattern of WOMEN_TARGETING_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("potential_women_targeting");
      womenTargetingDetected = true;
    }
    pattern.lastIndex = 0;
  }

  if (/kill|die|murder|death|attack|threat/i.test(text)) {
    flags.push("threat_detected");
    hasThreat = true;
  }

  if (/nude|naked|sex|sexy|erotic|porn/i.test(text)) {
    flags.push("sexual_content_detected");
    hasSexual = true;
  }

  if (/scam|phish|fake|bank|account|password|money|transfer/i.test(text)) {
    flags.push("potential_scam");
  }

  return {
    flags,
    minorDetected,
    womenTargetingDetected,
    hasToxicity,
    hasThreat,
    hasSexual,
  };
}

export async function analyzeContent(
  text: string,
  userId?: string,
): Promise<ModerationResult> {
  const cacheKey = getCacheKey("moderation", text.substring(0, 50));
  const cached = contentCache.get<ModerationResult>(cacheKey);
  if (cached) {
    return cached;
  }

  const patternResult = analyzePatterns(text);

  let perspectiveResult: PerspectiveResult | null = null;

  if (userId && !moderationRateLimit.check(userId)) {
    console.log(`Rate limit exceeded for user ${userId}`);
  }

  try {
    perspectiveResult = await callGooglePerspectiveAPI(text);
  } catch (error) {
    console.error("Error calling Perspective API:", error);
  }

  const aiToxicity = perspectiveResult?.toxicity || 0;
  const aiThreat = perspectiveResult?.threat || 0;
  const aiSexual = perspectiveResult?.sexualExplicit || 0;
  const aiHarassment = perspectiveResult?.identityAttack || 0;

  const maxScore = Math.max(
    patternResult.hasToxicity ? 0.7 : 0,
    patternResult.hasThreat ? 0.8 : 0,
    patternResult.hasSexual ? 0.6 : 0,
    aiToxicity,
    aiThreat,
    aiSexual,
  );

  let riskLevel: ModerationResult["riskLevel"] = "low";
  let suggestedAction: ModerationResult["suggestedAction"] = "allow";

  if (maxScore >= 0.8 || patternResult.minorDetected) {
    riskLevel = "critical";
    suggestedAction = "block";
  } else if (maxScore >= 0.6) {
    riskLevel = "high";
    suggestedAction = "block";
  } else if (maxScore >= 0.4) {
    riskLevel = "medium";
    suggestedAction = "warn";
  } else if (maxScore >= 0.2) {
    riskLevel = "low";
  }

  if (patternResult.womenTargetingDetected) {
    riskLevel = Math.max(
      riskLevel === "critical"
        ? 4
        : riskLevel === "high"
          ? 3
          : riskLevel === "medium"
            ? 2
            : 1,
      2,
    ) as ModerationResult["riskLevel"];
    if (riskLevel === "low") suggestedAction = "warn";
  }

  const result: ModerationResult = {
    isSafe: maxScore < 0.6 && !patternResult.minorDetected,
    flags: patternResult.flags,
    riskLevel,
    suggestedAction,
    minorDetected: patternResult.minorDetected,
    womenTargetingDetected: patternResult.womenTargetingDetected,
    aiScore: {
      toxicity: aiToxicity,
      threat: aiThreat,
      sexual: aiSexual,
      harassment: aiHarassment,
    },
    confidence: perspectiveResult ? 0.9 : 0.5,
  };

  contentCache.set(cacheKey, result, 300);

  return result;
}

export async function aiModerationModule(app: FastifyInstance) {
  app.post<{ Body: { content: string; type: "message" | "post" | "profile" } }>(
    "/api/moderation/analyze",
    async (request, reply) => {
      const { content, type } = request.body;

      if (!content || content.length < 2) {
        return reply.status(400).send({
          success: false,
          error: "Content too short",
        });
      }

      if (content.length > 5000) {
        return reply.status(400).send({
          success: false,
          error: "Content too long (max 5000 characters)",
        });
      }

      const result = await analyzeContent(content);

      if (result.suggestedAction === "ban") {
        await app.prisma.auditLog.create({
          data: {
            userId: "system",
            action: "CONTENT_BANNED",
            entityType: type,
            details: {
              content: content.substring(0, 100),
              flags: result.flags,
            },
          },
        });
      }

      return reply.send({
        success: true,
        data: {
          isSafe: result.isSafe,
          riskLevel: result.riskLevel,
          suggestedAction: result.suggestedAction,
          flags: result.flags,
          minorDetected: result.minorDetected,
          womenTargetingDetected: result.womenTargetingDetected,
          aiScore: result.aiScore,
          confidence: result.confidence,
        },
      });
    },
  );

  app.get("/api/moderation/status", async () => {
    const perspectiveKey = !!process.env.GOOGLE_PERSPECTIVE_API_KEY;
    const geminiKey = !!process.env.GEMINI_API_KEY;

    return {
      success: true,
      data: {
        perspectiveAPI: perspectiveKey ? "configured" : "not_configured",
        geminiAPI: geminiKey ? "configured" : "not_configured",
        moderationEnabled: true,
      },
    };
  });
}
