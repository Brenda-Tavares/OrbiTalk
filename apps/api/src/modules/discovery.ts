import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function discoveryModule(app: FastifyInstance) {
  // Get discovery settings
  app.get("/discovery/settings", async (request, reply) => {
    const user = (request as any).user;

    const dbUser = await app.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        discoveryCountry: true,
        discoveryCountries: true,
        discoveryAgeMin: true,
        discoveryAgeMax: true,
        discoveryGenders: true,
        subscription: true,
        subscriptionExpiresAt: true,
        gender: true,
      },
    });

    const isPremium =
      dbUser?.subscription === "PREMIUM" ||
      dbUser?.subscription === "MULTI_COUNTRY";

    return reply.send({
      success: true,
      data: {
        country: dbUser?.discoveryCountry,
        countries: dbUser?.discoveryCountries || [],
        ageMin: dbUser?.discoveryAgeMin || 18,
        ageMax: dbUser?.discoveryAgeMax || 99,
        genders: dbUser?.discoveryGenders || [
          "WOMAN",
          "MAN",
          "PREFER_NOT_TO_ANSWER",
        ],
        isPremium,
        canUseMultiCountry: isPremium,
      },
    });
  });

  // Update discovery settings
  app.put("/discovery/settings", async (request, reply) => {
    const user = (request as any).user;
    const schema = z.object({
      country: z.string().optional(),
      ageMin: z.number().min(18).max(100).optional(),
      ageMax: z.number().min(18).max(100).optional(),
      genders: z
        .array(z.enum(["WOMAN", "MAN", "PREFER_NOT_TO_ANSWER"]))
        .optional(),
    });

    const body = schema.parse(request.body);

    // Check if user can use multi-country
    if (body.country && body.country !== "all") {
      const dbUser = await app.prisma.user.findUnique({
        where: { id: user.userId },
        select: { subscription: true, subscriptionExpiresAt: true },
      });

      const isPremium =
        dbUser?.subscription === "PREMIUM" ||
        dbUser?.subscription === "MULTI_COUNTRY";

      if (!isPremium) {
        return reply.status(403).send({
          success: false,
          error: "Multi-country search requires premium subscription",
          upgradeUrl: "/subscription/multi-country",
        });
      }
    }

    await app.prisma.user.update({
      where: { id: user.userId },
      data: {
        discoveryCountry: body.country || null,
        discoveryAgeMin: body.ageMin || 18,
        discoveryAgeMax: body.ageMax || 99,
        discoveryGenders: body.genders || [
          "WOMAN",
          "MAN",
          "PREFER_NOT_TO_ANSWER",
        ],
      },
    });

    return reply.send({
      success: true,
      message: "Discovery settings updated",
    });
  });

  // Discover people
  app.get("/discover", async (request, reply) => {
    const user = (request as any).user;
    const {
      country,
      ageMin,
      ageMax,
      gender,
      page = "1",
      limit = "20",
    } = request.query as {
      country?: string;
      ageMin?: string;
      ageMax?: string;
      gender?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const skip = (pageNum - 1) * limitNum;

    // Get user's settings
    const currentUser = await app.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        discoveryCountry: true,
        discoveryCountries: true,
        discoveryAgeMin: true,
        discoveryAgeMax: true,
        discoveryGenders: true,
        subscription: true,
        blockedUsers: true,
        friendsInitiated: { select: { receiverId: true, status: true } },
        friendsReceived: { select: { senderId: true, status: true } },
      },
    });

    // Build query
    const ageMinNum = parseInt(ageMin) || currentUser?.discoveryAgeMin || 18;
    const ageMaxNum = parseInt(ageMax) || currentUser?.discoveryAgeMax || 99;

    // Calculate birth date range
    const now = new Date();
    const maxBirthDate = new Date(
      now.getFullYear() - ageMinNum,
      now.getMonth(),
      now.getDate(),
    );
    const minBirthDate = new Date(
      now.getFullYear() - ageMaxNum - 1,
      now.getMonth(),
      now.getDate(),
    );

    // Get friend IDs to exclude
    const friendIds = [
      ...(currentUser?.friendsInitiated || [])
        .filter((f) => f.status === "ACCEPTED")
        .map((f) => f.receiverId),
      ...(currentUser?.friendsReceived || [])
        .filter((f) => f.status === "ACCEPTED")
        .map((f) => f.senderId),
    ];

    // Countries to search
    const searchCountries =
      country === "all"
        ? currentUser?.discoveryCountries?.length
          ? currentUser.discoveryCountries
          : currentUser?.discoveryCountry
            ? [currentUser.discoveryCountry]
            : []
        : [country || currentUser?.discoveryCountry || "all"];

    // Genders to search
    const searchGenders = gender
      ? [gender as any]
      : currentUser?.discoveryGenders?.length
        ? currentUser.discoveryGenders
        : ["WOMAN", "MAN", "PREFER_NOT_TO_ANSWER"];

    // Query users
    const users = await app.prisma.user.findMany({
      where: {
        id: {
          notIn: [
            user.userId,
            ...friendIds,
            ...(currentUser?.blockedUsers || []),
          ],
        },
        isBanned: false,
        isVerified: true,
        birthDate: {
          gte: minBirthDate,
          lte: maxBirthDate,
        },
        gender: {
          in: searchGenders.length < 3 ? searchGenders : undefined,
        },
        OR:
          searchCountries[0] !== "all" && searchCountries[0] !== undefined
            ? searchCountries.map((c) => ({ countryCode: c }))
            : undefined,
      },
      select: {
        id: true,
        nickname: true,
        tag: true,
        avatar: true,
        gender: true,
        countryCode: true,
        country: true,
        birthDate: true,
        description: true,
        mbti: true,
        isVerified: true,
        hobbies: true,
        languagesIKnow: {
          select: { language: true, level: true },
        },
        education: {
          select: { institution: true, degree: true, course: true },
          take: 1,
        },
      },
      skip,
      take: limitNum,
      orderBy: { lastSeenAt: "desc" },
    });

    // Get pending friend requests
    const pendingRequests = await app.prisma.friendRequest.findMany({
      where: {
        senderId: user.userId,
        status: "PENDING",
      },
      select: { receiverId: true },
    });
    const pendingIds = pendingRequests.map((r) => r.receiverId);

    // Format response
    const formattedUsers = users.map((u) => ({
      id: u.id,
      nickname: u.nickname,
      tag: u.tag,
      fullHandle: `${u.nickname}#${u.tag}`,
      avatar: u.avatar,
      gender: u.gender,
      country: u.countryCode,
      age: calculateAge(u.birthDate),
      description: u.description,
      mbti: u.mbti,
      isVerified: u.isVerified,
      hobbies: u.hobbies?.slice(0, 5) || [],
      languages: u.languagesIKnow.map((l) => ({
        code: l.language,
        level: l.level,
      })),
      education: u.education[0] || null,
      hasPendingRequest: pendingIds.includes(u.id),
    }));

    return reply.send({
      success: true,
      data: {
        users: formattedUsers,
        page: pageNum,
        limit: limitNum,
        hasMore: users.length === limitNum,
      },
    });
  });

  // Get user profile (for discovery)
  app.get("/discover/:userId", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const currentUserId = (request as any).user?.userId;

    const targetUser = await app.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        tag: true,
        avatar: true,
        gender: true,
        showGender: true,
        country: true,
        countryCode: true,
        showLocation: true,
        birthDate: true,
        description: true,
        mbti: true,
        isVerified: true,
        hobbies: true,
        hobbiesCustom: true,
        musicLikes: true,
        movieLikes: true,
        seriesLikes: true,
        foodLikes: true,
        foodLikesCustom: true,
        drinks: true,
        drinksCustom: true,
        desserts: true,
        dessertsCustom: true,
        languagesIKnow: {
          select: { language: true, level: true },
        },
        languagesToLearn: {
          select: { language: true },
        },
        education: {
          select: {
            institution: true,
            degree: true,
            course: true,
            isCurrent: true,
          },
        },
        lifestyleChoices: {
          select: { substance: true, frequency: true, description: true },
        },
        pets: true,
        createdAt: true,
        // For men: show warning info
        warningCount: true,
        reportedHarassments: true,
        isBanned: true,
      },
    });

    if (!targetUser) {
      return reply.status(404).send({
        success: false,
        error: "User not found",
      });
    }

    // Check if can view warning info
    const canViewWarningInfo =
      targetUser.gender === "MAN" ||
      targetUser.gender === "PREFER_NOT_TO_ANSWER";

    // Get active limitation if any
    let warningInfo = null;
    if (canViewWarningInfo) {
      const activeLimitation = await app.prisma.moderation.findFirst({
        where: {
          targetUserId: userId,
          action: "chat_limited",
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: "desc" },
      });

      if (targetUser.warningCount > 0 || activeLimitation) {
        warningInfo = {
          hasWarnings: targetUser.warningCount > 0,
          warningCount: targetUser.warningCount,
          harassmentReports: targetUser.reportedHarassments,
          isCurrentlyLimited: !!activeLimitation,
          limitationExpiresAt: activeLimitation
            ? new Date(
                activeLimitation.createdAt.getTime() + 24 * 60 * 60 * 1000,
              )
            : null,
        };
      }
    }

    // Calculate age
    const age = calculateAge(targetUser.birthDate);

    return reply.send({
      success: true,
      data: {
        id: targetUser.id,
        nickname: targetUser.nickname,
        tag: targetUser.tag,
        fullHandle: `${targetUser.nickname}#${targetUser.tag}`,
        avatar: targetUser.avatar,
        gender: targetUser.showGender ? targetUser.gender : null,
        country: targetUser.showLocation ? targetUser.country : null,
        countryCode: targetUser.showLocation ? targetUser.countryCode : null,
        age,
        description: targetUser.description,
        mbti: targetUser.mbti,
        isVerified: targetUser.isVerified,
        hobbies: [
          ...(targetUser.hobbies || []),
          ...(targetUser.hobbiesCustom || []),
        ],
        music: targetUser.musicLikes,
        movies: targetUser.movieLikes,
        series: targetUser.seriesLikes,
        food: [
          ...(targetUser.foodLikes || []),
          ...(targetUser.foodLikesCustom || []),
        ],
        drinks: [
          ...(targetUser.drinks || []),
          ...(targetUser.drinksCustom || []),
        ],
        desserts: [
          ...(targetUser.desserts || []),
          ...(targetUser.dessertsCustom || []),
        ],
        languages: targetUser.languagesIKnow.map((l) => ({
          code: l.language,
          level: l.level,
        })),
        learningLanguages: targetUser.languagesToLearn.map((l) => l.language),
        education: targetUser.education,
        lifestyle: targetUser.lifestyleChoices,
        pets: targetUser.pets,
        memberSince: targetUser.createdAt,
        warningInfo,
      },
    });
  });

  // Send friend request from discovery
  app.post("/friend/request", async (request, reply) => {
    const user = (request as any).user;
    const { userId } = request.body as { userId: string };

    if (userId === user.userId) {
      return reply.status(400).send({
        success: false,
        error: "You cannot add yourself",
      });
    }

    // Check if target exists
    const target = await app.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true, tag: true },
    });

    if (!target) {
      return reply.status(404).send({
        success: false,
        error: "User not found",
      });
    }

    // Check if already friends
    const existing = await app.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: user.userId, receiverId: userId },
          { senderId: userId, receiverId: user.userId },
        ],
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });

    if (existing?.status === "ACCEPTED") {
      return reply.status(400).send({
        success: false,
        error: "You are already friends",
      });
    }

    if (existing?.status === "PENDING" && existing.senderId === user.userId) {
      return reply.status(400).send({
        success: false,
        error: "Request already sent",
      });
    }

    // Create request
    const request_obj = await app.prisma.friendRequest.create({
      data: {
        senderId: user.userId,
        receiverId: userId,
        status: "PENDING",
      },
    });

    // Notify target
    await app.prisma.notification.create({
      data: {
        userId,
        type: "FRIEND_REQUEST",
        title: "New Friend Request",
        body: `You have a new friend request from ${target.nickname}#${target.tag}`,
        data: { requestId: request_obj.id, senderId: user.userId },
      },
    });

    return reply.status(201).send({
      success: true,
      message: `Friend request sent to ${target.nickname}#${target.tag}`,
      data: { requestId: request_obj.id },
    });
  });

  // Block user with reason
  app.post("/block/:userId", async (request, reply) => {
    const user = (request as any).user;
    const { userId } = request.params as { userId: string };
    const { reason, otherReason } = request.body as {
      reason:
        | "HARASSMENT"
        | "INAPPROPRIATE_CONTENT"
        | "PERSONAL_REASON"
        | "OTHER";
      otherReason?: string;
    };

    if (userId === user.userId) {
      return reply.status(400).send({
        success: false,
        error: "You cannot block yourself",
      });
    }

    if (reason === "OTHER" && !otherReason) {
      return reply.status(400).send({
        success: false,
        error: 'Please provide a reason for "other"',
      });
    }

    const target = await app.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!target) {
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

    // Remove any friendships
    await app.prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: user.userId, receiverId: userId },
          { senderId: userId, receiverId: user.userId },
        ],
      },
    });

    // Audit log
    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "USER_BLOCKED",
        entityType: "User",
        entityId: userId,
        metadata: {
          reason,
          otherReason,
          blockedAt: new Date().toISOString(),
        },
      },
    });

    return reply.send({
      success: true,
      message: `User blocked successfully. Reason: ${reason === "OTHER" ? otherReason : reason}`,
    });
  });
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
