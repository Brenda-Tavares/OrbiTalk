import { FastifyInstance } from "fastify";
import { z } from "zod";

interface ModerationResult {
  isSafe: boolean;
  flags: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  suggestedAction: "allow" | "warn" | "block" | "ban";
  minorDetected: boolean;
  womenTargetingDetected: boolean;
  contentAnalysis: {
    hasSexualContent: boolean;
    hasViolence: boolean;
    hasThreats: boolean;
    hasExploitation: boolean;
    confidence: number;
  };
}

const HARASSMENT_PATTERNS = [
  /\b(naked|nude|send.*pic|send.*photo|show.*body|show.*tits|show.*ass|show.*boobs|dm.*me|private.*chat|sexy.*pic|nude.*pic)\b/gi,
  /\b(fuck.*you|fuck.*off|you.*whore|you.*slut|bitch|nasty.*girl|nasty.*boy)\b/gi,
  /\b(i.*want.*sex|i.*need.*sex|let.*sex|have.*sex|hook.*up|booty.*call|fwb)\b/gi,
  /\b(kill.*you|will.*kill|i.*kill|death.*threat|murder|rape.*you)\b/gi,
  /\b(hack.*you|i.*know.*where.*you|i.*find.*you|destroy.*you)\b/gi,
  /\b(bomb|attack|terror|harm.*you|beat.*you)\b/gi,
  /\b(young|little|kid|teen|baby.*girl|baby.*boy|minor)\b/gi,
  /\b(how.*old.*you|age|underage|not.*18|under.*18)\b/gi,
  /\b(teacher|mom|dad|sister|brother|familyman|family.*girl)\b/gi,
  /\b(don.*tell.*anyone|secret|private|off.*record|no.*one.*knows)\b/gi,
  /\b(trust.*me|believe.*me|just.*this.*once|special.*favor)\b/gi,
  /\b(i.*will|you.*will|must|forced|compel|coerced)\b/gi,
  /\b(go.*kitchen|back.*to.*kitchen|woman.*belong|bitch|slut|whore)\b/gi,
  /\b(you.*look.*like|ugly|fat|too.*skinny|not.*pretty|more.*pretty)\b/gi,
  /\b(rape|kill.*you|die.*bitch|dumb.*woman|stupid.*girl)\b/gi,
  /\b(shut.*up|quiet|bossy|nice.*girl|good.*girl|like.*a.*man)\b/gi,
  /\b(sexual.*harassment|inappropriate|lewd|obscene)\b/gi,
];

const WOMEN_TARGETING_PATTERNS = [
  /(?:alone|home|married|single|divorced|widow)/gi,
  /(?:husband|boyfriend|father|brother|son|daughter)/gi,
  /(?:breast|boob|tits|ass|leg|body|figure|looks)/gi,
  /(?:wear|wearing|clothes|dress|skirt|shorts)/gi,
  /(?:meeting|meet|come.*over|visit|your.*place|my.*place)/gi,
  /(?:alone|at.*night|late|evening|morning)/gi,
];

const SUSPICIOUS_PATTERNS = [
  /http[s]?:\/\/[^\s]+/gi,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/gi,
  /@[\w]{1,15}/gi,
];

const SEXUAL_CONTENT_PATTERNS = [
  /\b(sex|naked|nude|nsfw|adult|erotic|sexy|horny|wet|dick|pussy|cock|penis|vagina|boob|tits|ass|butt|horny|horniest)\b/gi,
  /\b(blowjob|handjob|masturbat|orgy|gangbang|squirt)\b/gi,
  /\b(hentai|yaoi|yuri|fetish|bdsm)\b/gi,
];

const VIOLENCE_PATTERNS = [
  /\b(kill|murder|rape|assault|abuse|torture|bomb|terror|attack|hate|harming)\b/gi,
  /\b(beat|destroy|harm|threat|terrorize)\b/gi,
];

const EXPLOITATION_PATTERNS = [
  /(?:young|little|kid|teen|baby).*(?:girl|boy|person)/gi,
  /(?:how.*old|age|underage|not.*18|under.*18)/gi,
  /(?:teacher|mom|dad).*(?:like|love|prefer)/gi,
];

export async function analyzeContent(
  content: string,
): Promise<ModerationResult> {
  const flags: string[] = [];
  let riskLevel: ModerationResult["riskLevel"] = "low";
  let minorDetected = false;
  let womenTargetingDetected = false;
  let hasSexualContent = false;
  let hasViolence = false;
  let hasThreats = false;
  let hasExploitation = false;

  // Check harassment patterns
  for (const pattern of HARASSMENT_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      flags.push(`Harassment: "${matches[0]}"`);
      riskLevel = "high";
    }
  }

  // Check sexual content
  for (const pattern of SEXUAL_CONTENT_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      flags.push(`Sexual content: "${matches[0]}"`);
      hasSexualContent = true;
      if (riskLevel === "low") riskLevel = "medium";
    }
  }

  // Check violence
  for (const pattern of VIOLENCE_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      flags.push(`Violence: "${matches[0]}"`);
      hasViolence = true;
      if (riskLevel === "low") riskLevel = "high";
    }
  }

  // Check threats
  if (/kill|threat|destroy|hack|find.*you/i.test(content)) {
    hasThreats = true;
    flags.push("Potential threats detected");
    if (riskLevel !== "critical") riskLevel = "high";
  }

  // Women targeting
  for (const pattern of WOMEN_TARGETING_PATTERNS) {
    if (pattern.test(content)) {
      womenTargetingDetected = true;
      flags.push("Potential targeting behavior");
      if (riskLevel === "low") riskLevel = "medium";
    }
  }

  // Suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      flags.push("Suspicious pattern");
      if (riskLevel === "low") riskLevel = "medium";
    }
  }

  // Exploitation patterns
  for (const pattern of EXPLOITATION_PATTERNS) {
    if (pattern.test(content)) {
      hasExploitation = true;
      minorDetected = true;
      flags.push("Potential exploitation detected");
      riskLevel = "critical";
    }
  }

  // Coercion check
  if (/must|forced|compel|coerced|you.*will|do.*it.*or/i.test(content)) {
    flags.push("Potential coercion");
    if (riskLevel !== "critical") riskLevel = "high";
  }

  // Determine action
  let suggestedAction: ModerationResult["suggestedAction"] = "allow";
  if (minorDetected) {
    suggestedAction = "ban";
  } else if (riskLevel === "critical" || hasThreats) {
    suggestedAction = "ban";
  } else if (riskLevel === "high" || womenTargetingDetected) {
    suggestedAction = "block";
  } else if (riskLevel === "medium") {
    suggestedAction = "warn";
  }

  // Calculate confidence based on pattern matches
  const confidence = Math.min(
    100,
    flags.length * 15 + (riskLevel === "critical" ? 40 : 0),
  );

  return {
    isSafe: flags.length === 0,
    flags,
    riskLevel,
    suggestedAction,
    minorDetected,
    womenTargetingDetected,
    contentAnalysis: {
      hasSexualContent,
      hasViolence,
      hasThreats,
      hasExploitation,
      confidence,
    },
  };
}

export async function moderationModule(app: FastifyInstance) {
  // Analyze message with AI
  app.post("/moderate/message", async (request, reply) => {
    const { messageId, content } = request.body as {
      messageId?: string;
      content: string;
    };

    const result = await analyzeContent(content);

    if (!result.isSafe && messageId) {
      await app.prisma.message.update({
        where: { id: messageId },
        data: {
          aiFlagged: true,
          aiFlagReason: result.flags.join("; "),
        },
      });
    }

    return reply.send({
      success: true,
      data: result,
    });
  });

  // Report user/content with AI analysis
  app.post("/report", async (request, reply) => {
    const user = (request as any).user;
    const schema = z.object({
      reportedUserId: z.string(),
      reason: z.enum([
        "harassment",
        "minor_content",
        "threat",
        "inappropriate_content",
        "profile_fraud",
        "sexual_harassment",
        "non_consensual_sharing",
        "scam_attempt",
        "spam",
        "other",
      ]),
      otherReason: z.string().optional(),
      description: z.string().optional(),
      messageId: z.string().optional(),
      chatId: z.string().optional(),
      evidenceUrl: z.string().optional(),
    });

    const body = schema.parse(request.body);

    // Require description for "other" reason
    if (body.reason === "other" && !body.otherReason) {
      return reply.status(400).send({
        success: false,
        error: 'Please provide a description for "other" reason',
      });
    }

    const reportedUser = await app.prisma.user.findUnique({
      where: { id: body.reportedUserId },
    });

    if (reportedUser?.isBanned) {
      return reply.status(400).send({
        success: false,
        error: "User is already under review",
      });
    }

    // AI Analysis of the report
    const aiAnalysis =
      body.description || body.otherReason
        ? await analyzeContent(body.description || body.otherReason || "")
        : { isSafe: true, flags: [], riskLevel: "low" as const };

    const reporter = await app.prisma.user.findUnique({
      where: { id: user.userId },
      select: { countryCode: true },
    });

    const finalReason =
      body.reason === "other" ? `other: ${body.otherReason}` : body.reason;

    const report = await app.prisma.report.create({
      data: {
        reporterId: user.userId,
        reportedId: body.reportedUserId,
        reason: finalReason,
        description: body.description,
        messageId: body.messageId,
        chatId: body.chatId,
        evidenceUrl: body.evidenceUrl,
        country: reporter?.countryCode || "DEFAULT",
        aiAnalysis: aiAnalysis,
      },
    });

    // Auto-severity based on AI analysis
    if (aiAnalysis.riskLevel === "critical" || aiAnalysis.minorDetected) {
      await triggerEmergencyReview(app, report.id);
    }

    if (body.reason === "harassment" || body.reason === "sexual_harassment") {
      await app.prisma.user.update({
        where: { id: body.reportedUserId },
        data: { reportedHarassments: { increment: 1 } },
      });
    }

    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "CONTENT_REPORTED",
        entityType: "Report",
        entityId: report.id,
        metadata: {
          reportedId: body.reportedUserId,
          reason: body.reason,
          aiRiskLevel: aiAnalysis.riskLevel,
        },
        ipAddress: request.ip,
      },
    });

    return reply.status(201).send({
      success: true,
      message:
        "Report submitted. Our AI is analyzing this report with priority.",
      data: {
        reportId: report.id,
        aiAnalysis,
        legalGuidance: getLegalGuidance(reporter?.countryCode || "DEFAULT"),
      },
    });
  });

  // Block user
  app.post("/block/:userId", async (request, reply) => {
    const user = (request as any).user;
    const { userId } = request.params as { userId: string };

    if (user.userId === userId) {
      return reply.status(400).send({
        success: false,
        error: "You cannot block yourself",
      });
    }

    const targetUser = await app.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return reply.status(404).send({
        success: false,
        error: "User not found",
      });
    }

    // Add to blocked list
    await app.prisma.user.update({
      where: { id: user.userId },
      data: {
        blockedUsers: {
          push: userId,
        },
      },
    });

    // Remove any friend requests between users
    await app.prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: user.userId, receiverId: userId },
          { senderId: userId, receiverId: user.userId },
        ],
      },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "USER_BLOCKED",
        entityType: "User",
        entityId: userId,
        metadata: { blockedAt: new Date().toISOString() },
      },
    });

    return reply.send({
      success: true,
      message: "User blocked successfully",
    });
  });

  // Unblock user
  app.post("/unblock/:userId", async (request, reply) => {
    const user = (request as any).user;
    const { userId } = request.params as { userId: string };

    const currentUser = await app.prisma.user.findUnique({
      where: { id: user.userId },
      select: { blockedUsers: true },
    });

    if (!currentUser?.blockedUsers.includes(userId)) {
      return reply.status(400).send({
        success: false,
        error: "User is not blocked",
      });
    }

    await app.prisma.user.update({
      where: { id: user.userId },
      data: {
        blockedUsers: {
          set: currentUser.blockedUsers.filter((id) => id !== userId),
        },
      },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "USER_UNBLOCKED",
        entityType: "User",
        entityId: userId,
      },
    });

    return reply.send({
      success: true,
      message: "User unblocked successfully",
    });
  });

  // Get blocked users
  app.get("/blocked", async (request, reply) => {
    const user = (request as any).user;

    const currentUser = await app.prisma.user.findUnique({
      where: { id: user.userId },
      select: { blockedUsers: true },
    });

    const blockedUsers = await app.prisma.user.findMany({
      where: { id: { in: currentUser?.blockedUsers || [] } },
      select: {
        id: true,
        nickname: true,
        tag: true,
        avatar: true,
        isVerified: true,
      },
    });

    return reply.send({
      success: true,
      data: blockedUsers,
    });
  });

  // Check if user is blocked
  app.get("/is-blocked/:userId", async (request, reply) => {
    const user = (request as any).user;
    const { userId } = request.params as { userId: string };

    const currentUser = await app.prisma.user.findUnique({
      where: { id: user.userId },
      select: { blockedUsers: true },
    });

    const isBlocked = currentUser?.blockedUsers.includes(userId) || false;

    return reply.send({
      success: true,
      data: { isBlocked },
    });
  });

  // Consent request for adult content
  app.post("/adult-consent/request", async (request, reply) => {
    const user = (request as any).user;
    const { targetUserId, chatId } = request.body as {
      targetUserId: string;
      chatId: string;
    };

    // Check if users are friends
    const friendship = await app.prisma.friendRequest.findFirst({
      where: {
        OR: [
          {
            senderId: user.userId,
            receiverId: targetUserId,
            status: "ACCEPTED",
          },
          {
            senderId: targetUserId,
            receiverId: user.userId,
            status: "ACCEPTED",
          },
        ],
      },
    });

    if (!friendship) {
      return reply.status(400).send({
        success: false,
        error: "You must be friends to request adult content exchange",
      });
    }

    // Check existing pending requests
    const existingRequest = await app.prisma.adultContentRequest.findFirst({
      where: {
        chatId,
        requesterId: user.userId,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
    });

    if (existingRequest) {
      return reply.status(400).send({
        success: false,
        error: "You already have a pending request",
      });
    }

    // Create consent request with 5 minute expiry
    const consentRequest = await app.prisma.adultContentRequest.create({
      data: {
        chatId,
        requesterId: user.userId,
        contentType: "pending",
        status: "pending",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Notify target user
    await app.prisma.notification.create({
      data: {
        userId: targetUserId,
        type: "ADULT_CONTENT_REQUEST",
        title: "Adult Content Request",
        body: "Someone is requesting to exchange adult content with you. Review and accept or decline.",
        data: {
          requestId: consentRequest.id,
          chatId,
          requesterId: user.userId,
        },
      },
    });

    return reply.send({
      success: true,
      message: "Consent request sent",
      data: { requestId: consentRequest.id },
    });
  });

  // Approve adult content consent (with confirmation)
  app.post("/adult-consent/approve/:requestId", async (request, reply) => {
    const user = (request as any).user;
    const { requestId } = request.params as { requestId: string };
    const { confirm } = request.body as { confirm: boolean };

    // Require explicit confirmation
    if (!confirm) {
      return reply.status(400).send({
        success: false,
        error: "Please confirm you want to accept this request",
        requiresConfirmation: true,
        message:
          "Are you sure? Click confirm to accept. Remember: this is your choice.",
      });
    }

    const consentRequest = await app.prisma.adultContentRequest.findUnique({
      where: { id: requestId },
    });

    if (!consentRequest || consentRequest.status !== "pending") {
      return reply.status(400).send({
        success: false,
        error: "Request not found or expired",
      });
    }

    if (consentRequest.expiresAt < new Date()) {
      await app.prisma.adultContentRequest.update({
        where: { id: requestId },
        data: { status: "expired" },
      });
      return reply.status(400).send({
        success: false,
        error: "Request has expired",
      });
    }

    // Update request status
    await app.prisma.adultContentRequest.update({
      where: { id: requestId },
      data: { status: "approved", updatedAt: new Date() },
    });

    // Notify requester
    await app.prisma.notification.create({
      data: {
        userId: consentRequest.requesterId,
        type: "ADULT_CONTENT_APPROVED",
        title: "Consent Approved",
        body: "Your request to exchange adult content has been approved. You may now send content.",
        data: { requestId, approvedBy: user.userId },
      },
    });

    return reply.send({
      success: true,
      message: "Adult content exchange approved. Both users have consented.",
    });
  });

  // Decline adult content consent
  app.post("/adult-consent/decline/:requestId", async (request, reply) => {
    const user = (request as any).user;
    const { requestId } = request.params as { requestId: string };

    const consentRequest = await app.prisma.adultContentRequest.findUnique({
      where: { id: requestId },
    });

    if (!consentRequest || consentRequest.status !== "pending") {
      return reply.status(400).send({
        success: false,
        error: "Request not found or already processed",
      });
    }

    await app.prisma.adultContentRequest.update({
      where: { id: requestId },
      data: { status: "declined", updatedAt: new Date() },
    });

    // Notify requester
    await app.prisma.notification.create({
      data: {
        userId: consentRequest.requesterId,
        type: "ADULT_CONTENT_DECLINED",
        title: "Consent Declined",
        body: "Your request to exchange adult content was declined.",
        data: { requestId, declinedBy: user.userId },
      },
    });

    return reply.send({
      success: true,
      message: "Request declined",
    });
  });

  // Get pending consent requests
  app.get("/adult-consent/pending", async (request, reply) => {
    const user = (request as any).user;

    const requests = await app.prisma.adultContentRequest.findMany({
      where: {
        chat: {
          participants: {
            some: { userId: user.userId },
          },
        },
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      include: {
        chat: {
          select: { id: true, type: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get requester info
    const requestsWithUser = await Promise.all(
      requests.map(async (req) => {
        const requester = await app.prisma.user.findUnique({
          where: { id: req.requesterId },
          select: { id: true, nickname: true, tag: true, avatar: true },
        });
        return { ...req, requester };
      }),
    );

    return reply.send({
      success: true,
      data: requestsWithUser,
    });
  });

  // Authenticate report for legal use
  app.post("/report/:reportId/authenticate", async (request, reply) => {
    const { reportId } = request.params as { reportId: string };

    const report = await app.prisma.report.update({
      where: { id: reportId },
      data: { legalStatus: "authenticated" },
    });

    await app.prisma.auditLog.create({
      data: {
        action: "REPORT_AUTHENTICATED",
        entityType: "Report",
        entityId: reportId,
        metadata: { authenticatedAt: new Date().toISOString() },
      },
    });

    return reply.send({
      success: true,
      message: "Report authenticated for legal use",
      data: {
        reportId,
        hash: generateReportHash(report),
        authenticatedAt: new Date().toISOString(),
      },
    });
  });

  // Get legal guidance
  app.get("/legal-guidance", async (request, reply) => {
    const { countryCode } = request.query as { countryCode?: string };
    let country = countryCode || "DEFAULT";

    if (!countryCode) {
      const user = (request as any).user;
      const dbUser = await app.prisma.user.findUnique({
        where: { id: user?.userId },
        select: { countryCode: true },
      });
      country = dbUser?.countryCode || "DEFAULT";
    }

    return reply.send({
      success: true,
      data: getLegalGuidance(country),
    });
  });
}

async function triggerEmergencyReview(app: FastifyInstance, reportId: string) {
  await app.prisma.auditLog.create({
    data: {
      action: "EMERGENCY_REVIEW_TRIGGERED",
      entityType: "Report",
      entityId: reportId,
      metadata: { priority: "HIGH", reason: "Critical content detected by AI" },
    },
  });
}

function generateReportHash(report: any): string {
  const data = JSON.stringify({
    id: report.id,
    reporterId: report.reporterId,
    reportedId: report.reportedId,
    reason: report.reason,
    createdAt: report.createdAt,
  });

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `ORBT-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
}

const LEGAL_GUIDANCE_MESSAGES: Record<
  string,
  {
    title: string;
    body: string;
    authorities: string[];
    links: Record<string, string>;
  }
> = {
  BR: {
    title: "Direitos da Mulher - Brasil",
    body: "Você pode denunciar crimes virtuais. O chat é prova judicial. Preserve evidências.",
    authorities: [
      "Delegacia da Mulher (DEAM)",
      "Disque 180",
      "Delegacia Online",
    ],
    links: { disque180: "https://www.gov.br/pt-br/servicos/disque-180" },
  },
  US: {
    title: "Women's Rights - United States",
    body: "Report cybercrimes. Chat logs are legal evidence. Preserve all evidence.",
    authorities: ["FBI IC3", "RAINN", "National Center for Victims"],
    links: { ic3: "https://www.ic3.gov/" },
  },
  CN: {
    title: "妇女权益 - 中国",
    body: "举报网络犯罪。聊天记录可作证据。",
    authorities: ["12338妇女热线", "公安机关"],
    links: { police: "https://www.12389.gov.cn/" },
  },
  DEFAULT: {
    title: "Women's Safety Guide",
    body: "Report crimes. Chat logs are evidence. Preserve all evidence.",
    authorities: ["Local Police", "Women's Rights Organizations"],
    links: {},
  },
};

function getLegalGuidance(countryCode: string) {
  return (
    LEGAL_GUIDANCE_MESSAGES[countryCode] || LEGAL_GUIDANCE_MESSAGES.DEFAULT
  );
}
