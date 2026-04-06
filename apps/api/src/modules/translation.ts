import { FastifyInstance } from "fastify";
import { z } from "zod";

// Gírias e termos por idioma para explicação
const SLANG_TERMS: Record<
  string,
  Record<string, { term: string; explanation: string }[]>
> = {
  "pt-BR": [
    {
      term: "vlw",
      explanation:
        'Abreviação de "valeu", significa agradecimento ou confirmação.',
    },
    {
      term: "tmj",
      explanation:
        'Abreviação de "tamo junto", significa solidarity or friendship.',
    },
    {
      term: "pdc",
      explanation: 'Abreviação de "pode crer", expressão de confirmação.',
    },
    {
      term: "krl",
      explanation:
        'Abreviação de "caralho", expressão de surpresa ou frustração.',
    },
    { term: "bj", explanation: 'Abreviação de "beijo".' },
    { term: "msm", explanation: 'Abreviação de "mesmo".' },
    { term: "vc", explanation: 'Abreviação de "você".' },
    { term: "tb", explanation: 'Abreviação de "também".' },
    { term: "ctza", explanation: 'Abreviação de "certeza".' },
    { term: "sdds", explanation: 'Abreviação de "saudades".' },
  ],
  en: [
    {
      term: "lol",
      explanation: "Laugh Out Loud - used when something is funny.",
    },
    { term: "brb", explanation: "Be Right Back - will return shortly." },
    { term: "omg", explanation: "Oh My God - expression of surprise." },
    { term: "tbh", explanation: "To Be Honest - stating honest opinion." },
    { term: "idk", explanation: "I Don't Know." },
    { term: "np", explanation: "No Problem." },
    { term: "w/", explanation: "With." },
    { term: "w/o", explanation: "Without." },
    { term: "imo", explanation: "In My Opinion." },
    { term: "ngl", explanation: "Not Gonna Lie - honest statement." },
  ],
  zh: [
    {
      term: "666",
      explanation:
        'Pronounced "liu liu liu", means "awesome" or "cool" in Chinese internet culture.',
    },
    {
      term: "内卷",
      explanation: "Involution - refers to excessive competition.",
    },
    { term: "躺平", explanation: "Lying flat - choosing not to work hard." },
    {
      term: "社恐",
      explanation: "Social phobia - fear of social interactions.",
    },
    {
      term: "杠精",
      explanation:
        "Argumentative person - someone who argues for the sake of arguing.",
    },
  ],
  ko: [
    { term: "ㅋㅋㅋ", explanation: 'Korean laughter, like "hahaha".' },
    { term: "ㅎㅎㅎ", explanation: 'Korean laughter, like "hehehe".' },
    {
      term: "건물",
      explanation:
        'Can mean "building" or in slang, "this is too much" (from 감당).',
    },
    { term: "잘가", explanation: '"Goodbye" or slang for "good luck".' },
  ],
  ja: [
    {
      term: "草",
      explanation:
        'Slang for laughter - "grass" because comments overflow like grass.',
    },
    {
      term: "バブみ",
      explanation: "Baby-like charm, attraction to nurturing behavior.",
    },
    {
      term: "ぴえん",
      explanation: "Crying sounds, means sadness or frustration.",
    },
  ],
  ru: [
    { term: "лол", explanation: 'Russian version of "lol" - laughter.' },
    {
      term: "кринж",
      explanation: "Cringe - feeling embarrassed for someone else.",
    },
    {
      term: "пздц",
      explanation: 'Abreviación de "пиздец", expresión de frustración.',
    },
  ],
};

// Pricing
const TRANSLATION_PRICING = {
  translation_unlimited: {
    monthly: { price: 4.99, currency: "USD" },
    semestral: { price: 24.99, duration: 6, currency: "USD" },
    permanent: { price: 49.99, currency: "USD" },
  },
  multi_country: {
    monthly: { price: 2.99, currency: "USD" },
    semestral: { price: 14.99, duration: 6, currency: "USD" },
    permanent: { price: 29.99, currency: "USD" },
  },
};

interface TranslatedTerm {
  word: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
}

interface TranslationResult {
  original: string;
  translated: string;
  terms: TranslatedTerm[];
  fromLang: string;
  toLang: string;
}

function detectTerms(text: string, targetLang: string): TranslatedTerm[] {
  const terms: TranslatedTerm[] = [];
  const langTerms = SLANG_TERMS[targetLang] || [];
  const lowerText = text.toLowerCase();

  for (const item of langTerms) {
    const index = lowerText.indexOf(item.term.toLowerCase());
    if (index !== -1) {
      terms.push({
        word: item.term,
        explanation: item.explanation,
        startIndex: index,
        endIndex: index + item.term.length,
      });
    }
  }

  return terms;
}

function explainSlangTerm(term: string, lang: string): string {
  const langTerms = SLANG_TERMS[lang] || [];
  const found = langTerms.find(
    (t) => t.term.toLowerCase() === term.toLowerCase(),
  );
  return found?.explanation || `Term used in ${lang} culture.`;
}

export async function translationModule(app: FastifyInstance) {
  // Translate message
  app.post("/translate", async (request, reply) => {
    const user = (request as any).user;
    const { text, targetLang, messageId } = request.body as {
      text: string;
      targetLang: string;
      messageId?: string;
    };

    // Check if user has premium
    const hasPremium =
      user.hasTranslationPremium &&
      (!user.translationPremiumExpiresAt ||
        new Date(user.translationPremiumExpiresAt) > new Date());

    // Check daily limit for non-premium
    if (!hasPremium) {
      // Reset if new day
      if (
        new Date(user.translationsResetAt) <
        new Date(new Date().setHours(0, 0, 0, 0))
      ) {
        await app.prisma.user.update({
          where: { id: user.userId },
          data: {
            dailyTranslations: 100,
            translationsResetAt: new Date(),
          },
        });
      } else if (user.dailyTranslations <= 0) {
        return reply.status(403).send({
          success: false,
          error: "Daily translation limit reached",
          limit: 100,
          resetAt: new Date(
            new Date(user.translationsResetAt).setHours(24, 0, 0, 0),
          ),
          upgradeUrl: "/subscription/translation-unlimited",
        });
      }

      // Decrement counter
      await app.prisma.user.update({
        where: { id: user.userId },
        data: { dailyTranslations: { decrement: 1 } },
      });
    }

    // Detect terms in original text
    const detectedTerms = detectTerms(text, targetLang);

    // In production, this would call an AI translation API
    // For now, we'll simulate translation
    const translatedText = `[${targetLang.toUpperCase()}] ${text}`;

    // If there's a messageId, save the translation
    if (messageId) {
      await app.prisma.message.update({
        where: { id: messageId },
        data: {
          translation: {
            text: translatedText,
            terms: detectedTerms,
          },
          translationLang: targetLang,
          translatedAt: new Date(),
        },
      });
    }

    return reply.send({
      success: true,
      data: {
        original: text,
        translated: translatedText,
        terms: detectedTerms,
        remaining: hasPremium ? "unlimited" : user.dailyTranslations - 1,
        isPremium: hasPremium,
      },
    });
  });

  // Get term explanation
  app.get("/term-explain", async (request, reply) => {
    const { term, lang } = request.query as { term: string; lang: string };

    const explanation = explainSlangTerm(term, lang);

    return reply.send({
      success: true,
      data: {
        term,
        language: lang,
        explanation,
      },
    });
  });

  // Get translation pricing
  app.get("/pricing", async (request, reply) => {
    return reply.send({
      success: true,
      data: {
        translation_unlimited: {
          name: "Unlimited Translations",
          description: "Translate without limits for 6 months",
          monthly: { price: 4.99, period: "1 month" },
          semestral: { price: 24.99, period: "6 months" },
          permanent: { price: 49.99, period: "forever" },
        },
        multi_country: {
          name: "Multi-Country Discovery",
          description: "Search people from multiple countries",
          monthly: { price: 2.99, period: "1 month" },
          semestral: { price: 14.99, period: "6 months" },
          permanent: { price: 29.99, period: "forever" },
        },
        bundle: {
          name: "Premium Bundle",
          description: "All features combined",
          price: 6.99,
          period: "1 month",
        },
      },
    });
  });

  // Subscribe to translation premium
  app.post("/subscribe/translation", async (request, reply) => {
    const user = (request as any).user;
    const { duration } = request.body as {
      duration: "monthly" | "semestral" | "permanent";
    };

    const pricing = TRANSLATION_PRICING.translation_unlimited[duration];
    const months =
      duration === "monthly" ? 1 : duration === "semestral" ? 6 : 999;
    const expiresAt =
      duration === "permanent"
        ? new Date("2099-12-31")
        : new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);

    // In production, this would integrate with payment gateway
    // For now, we'll simulate successful payment

    await app.prisma.user.update({
      where: { id: user.userId },
      data: {
        hasTranslationPremium: true,
        translationPremiumExpiresAt: expiresAt,
        subscription: "TRANSLATION_UNLIMITED",
        subscriptionExpiresAt: expiresAt,
      },
    });

    await app.prisma.subscription.create({
      data: {
        userId: user.userId,
        type: "TRANSLATION_UNLIMITED",
        duration: duration.toUpperCase(),
        price: pricing.price,
        currency: pricing.currency,
        status: "active",
        expiresAt,
      },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "SUBSCRIPTION_STARTED",
        entityType: "Subscription",
        metadata: { type: "TRANSLATION_UNLIMITED", duration },
      },
    });

    return reply.send({
      success: true,
      message: "Subscription activated! You now have unlimited translations.",
      data: {
        expiresAt,
        type: "TRANSLATION_UNLIMITED",
      },
    });
  });

  // Get translation status
  app.get("/status", async (request, reply) => {
    const user = (request as any).user;

    const dbUser = await app.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        dailyTranslations: true,
        translationsResetAt: true,
        hasTranslationPremium: true,
        translationPremiumExpiresAt: true,
      },
    });

    const hasPremium =
      dbUser?.hasTranslationPremium &&
      (!dbUser.translationPremiumExpiresAt ||
        new Date(dbUser.translationPremiumExpiresAt) > new Date());

    return reply.send({
      success: true,
      data: {
        remaining: hasPremium ? "unlimited" : dbUser?.dailyTranslations || 0,
        resetAt: new Date(
          new Date(dbUser?.translationsResetAt || new Date()).setHours(
            24,
            0,
            0,
            0,
          ),
        ),
        isPremium: hasPremium,
        expiresAt: dbUser?.translationPremiumExpiresAt,
      },
    });
  });
}
