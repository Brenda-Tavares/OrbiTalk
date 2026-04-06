import { FastifyInstance } from "fastify";

interface UserProfile {
  id: string;
  interests: string[];
  languages: string[];
  country: string;
  age: number;
}

interface CompatibilityResult {
  userId: string;
  targetUserId: string;
  score: number;
  breakdown: {
    interests: number;
    languages: number;
    location: number;
    age: number;
  };
  matchLevel: "excellent" | "good" | "fair" | "low";
}

const INTEREST_WEIGHT = 0.35;
const LANGUAGE_WEIGHT = 0.3;
const LOCATION_WEIGHT = 0.2;
const AGE_WEIGHT = 0.15;

function normalizeInterests(interests: string[]): string[] {
  return interests.map((i) => i.toLowerCase().trim());
}

function calculateInterestScore(
  userInterests: string[],
  targetInterests: string[],
): number {
  const normalizedUser = normalizeInterests(userInterests);
  const normalizedTarget = normalizeInterests(targetInterests);

  if (normalizedUser.length === 0 || normalizedTarget.length === 0) return 0;

  const matches = normalizedUser.filter((i) =>
    normalizedTarget.includes(i),
  ).length;
  const total = Math.max(normalizedUser.length, normalizedTarget.length);

  return matches / total;
}

function calculateLanguageScore(
  userLanguages: string[],
  targetLanguages: string[],
): number {
  const normalizedUser = userLanguages.map((l) => l.toLowerCase().trim());
  const normalizedTarget = targetLanguages.map((l) => l.toLowerCase().trim());

  if (normalizedUser.length === 0 || normalizedTarget.length === 0) return 0;

  const matches = normalizedUser.filter((l) =>
    normalizedTarget.includes(l),
  ).length;
  const total = Math.max(normalizedUser.length, normalizedTarget.length);

  return matches / total;
}

function calculateLocationScore(
  userCountry: string,
  targetCountry: string,
): number {
  if (!userCountry || !targetCountry) return 0.5;

  if (userCountry === targetCountry) return 1;

  const sameRegion: Record<string, string[]> = {
    BR: ["BR", "PT", "ES"],
    US: ["US", "CA", "MX"],
    CN: ["CN", "HK", "TW", "MO"],
    JP: ["JP", "KR"],
    KR: ["JP", "KR"],
    RU: ["RU", "UA", "BY", "KZ"],
    EU: ["GB", "FR", "DE", "IT", "NL", "BE", "ES"],
  };

  for (const region of Object.values(sameRegion)) {
    if (region.includes(userCountry) && region.includes(targetCountry)) {
      return 0.8;
    }
  }

  return 0.3;
}

function calculateAgeScore(userAge: number, targetAge: number): number {
  const ageDiff = Math.abs(userAge - targetAge);

  if (ageDiff <= 3) return 1;
  if (ageDiff <= 7) return 0.8;
  if (ageDiff <= 12) return 0.6;
  if (ageDiff <= 20) return 0.4;
  return 0.2;
}

export function calculateCompatibility(
  user: UserProfile,
  target: UserProfile,
): CompatibilityResult {
  const interestScore = calculateInterestScore(
    user.interests,
    target.interests,
  );
  const languageScore = calculateLanguageScore(
    user.languages,
    target.languages,
  );
  const locationScore = calculateLocationScore(user.country, target.country);
  const ageScore = calculateAgeScore(user.age, target.age);

  const totalScore =
    interestScore * INTEREST_WEIGHT +
    languageScore * LANGUAGE_WEIGHT +
    locationScore * LOCATION_WEIGHT +
    ageScore * AGE_WEIGHT;

  const percentage = Math.round(totalScore * 100);

  let matchLevel: CompatibilityResult["matchLevel"];
  if (percentage >= 70) matchLevel = "excellent";
  else if (percentage >= 50) matchLevel = "good";
  else if (percentage >= 30) matchLevel = "fair";
  else matchLevel = "low";

  return {
    userId: user.id,
    targetUserId: target.id,
    score: percentage,
    breakdown: {
      interests: Math.round(interestScore * 100),
      languages: Math.round(languageScore * 100),
      location: Math.round(locationScore * 100),
      age: Math.round(ageScore * 100),
    },
    matchLevel,
  };
}

function getMatchReasons(
  user: UserProfile,
  target: UserProfile,
  breakdown: CompatibilityResult["breakdown"],
): string[] {
  const reasons: string[] = [];

  if (breakdown.interests >= 50) {
    const commonInterests = normalizeInterests(user.interests).filter((i) =>
      normalizeInterests(target.interests).includes(i),
    );
    if (commonInterests.length > 0) {
      reasons.push(
        `Interesses em comum: ${commonInterests.slice(0, 3).join(", ")}`,
      );
    }
  }

  if (breakdown.languages >= 50) {
    const commonLangs = user.languages.filter((l) =>
      target.languages.map((ln) => ln.toLowerCase()).includes(l.toLowerCase()),
    );
    if (commonLangs.length > 0) {
      reasons.push(`Idiomas em comum: ${commonLangs.join(", ")}`);
    }
  }

  if (breakdown.location >= 70) {
    reasons.push("Mesma localização");
  } else if (breakdown.location >= 30) {
    reasons.push("Região próxima");
  }

  return reasons;
}

export async function compatibilityModule(app: FastifyInstance) {
  app.post<{
    Body: {
      user: UserProfile;
      targetUser: UserProfile;
    };
  }>("/api/compatibility/calculate", async (request, reply) => {
    const { user, targetUser } = request.body;

    if (!user?.id || !targetUser?.id) {
      return reply.status(400).send({
        success: false,
        error: "user and targetUser are required",
      });
    }

    const result = calculateCompatibility(user, targetUser);
    const reasons = getMatchReasons(user, targetUser, result.breakdown);

    return reply.send({
      success: true,
      data: {
        ...result,
        reasons,
      },
    });
  });

  app.post<{
    Body: {
      userId: string;
      targets: UserProfile[];
    };
  }>("/api/compatibility/rank", async (request, reply) => {
    const { userId, targets } = request.body;

    if (!userId || !targets?.length) {
      return reply.status(400).send({
        success: false,
        error: "userId and targets are required",
      });
    }

    const userProfile = targets.find((t) => t.id === userId);
    if (!userProfile) {
      return reply.status(404).send({
        success: false,
        error: "User not found in targets",
      });
    }

    const rankings = targets
      .filter((t) => t.id !== userId)
      .map((target) => {
        const result = calculateCompatibility(userProfile, target);
        const reasons = getMatchReasons(userProfile, target, result.breakdown);
        return {
          ...result,
          reasons,
        };
      })
      .sort((a, b) => b.score - a.score);

    return reply.send({
      success: true,
      data: {
        rankings,
        topMatch: rankings[0] || null,
      },
    });
  });

  app.get("/api/compatibility/factors", async () => {
    return {
      success: true,
      data: {
        factors: [
          {
            name: "Interesses",
            weight: INTEREST_WEIGHT * 100,
            description: "Pontos em comum nos interesses do usuário",
          },
          {
            name: "Idiomas",
            weight: LANGUAGE_WEIGHT * 100,
            description: "Idiomas que ambos falam",
          },
          {
            name: "Localização",
            weight: LOCATION_WEIGHT * 100,
            description: "País e região",
          },
          {
            name: "Idade",
            weight: AGE_WEIGHT * 100,
            description: "Proximidade de idade",
          },
        ],
        levels: [
          { level: "excellent", min: 70, label: "Excelente" },
          { level: "good", min: 50, label: "Bom" },
          { level: "fair", min: 30, label: "Regular" },
          { level: "low", min: 0, label: "Baixo" },
        ],
      },
    };
  });
}
