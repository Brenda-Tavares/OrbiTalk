import { FastifyInstance } from "fastify";
import { z } from "zod";

// AI Tutor conversation contexts by language
const TUTOR_PERSONAS: Record<
  string,
  { name: string; language: string; style: string }
> = {
  "pt-BR": {
    name: "Luna",
    language: "Português",
    style: "friendly, patient, encouraging, uses examples from daily life",
  },
  en: {
    name: "Leo",
    language: "English",
    style: "friendly, patient, encouraging, uses casual and formal examples",
  },
  zh: {
    name: "Ming",
    language: "中文",
    style:
      "friendly, patient, encouraging, uses simplified Chinese with pinyin when helpful",
  },
  yue: {
    name: "Mei",
    language: "粵語",
    style: "friendly, patient, encouraging, uses traditional characters",
  },
  ko: {
    name: "Min-jun",
    language: "한국어",
    style:
      "friendly, patient, encouraging, uses Korean with romanization when helpful",
  },
  ja: {
    name: "Yuki",
    language: "日本語",
    style:
      "friendly, patient, encouraging, uses Japanese with romaji when helpful",
  },
  ru: {
    name: "Alex",
    language: "Русский",
    style:
      "friendly, patient, encouraging, uses Cyrillic with transliteration when helpful",
  },
};

// Pricing for audio transcription
const AUDIO_TRANSCRIPTION_PRICING = {
  monthly: { price: 2.99, period: 1 },
  semestral: { price: 14.99, period: 6 },
  permanent: { price: 29.99, period: 999 },
};

// Daily limit for free audio transcription
const FREE_DAILY_AUDIO_LIMIT = 10;

interface AITutorMessage {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  pronunciationScore?: number;
  feedback?: string;
}

export async function languageAIModule(app: FastifyInstance) {
  // Get or create AI conversation session
  app.get("/ai/conversation", async (request, reply) => {
    const user = (request as any).user;
    const { language } = request.query as { language?: string };

    if (!language) {
      return reply.status(400).send({
        success: false,
        error: "Language is required",
      });
    }

    const tutor = TUTOR_PERSONAS[language] || TUTOR_PERSONAS["en"];

    // Get user's AI conversation history
    const messages = await app.prisma.auditLog.findMany({
      where: {
        userId: user.userId,
        action: { startsWith: "AI_CHAT_" },
        metadata: { path: ["language"], equals: language },
      },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return reply.send({
      success: true,
      data: {
        tutor: {
          name: tutor.name,
          language: tutor.language,
          style: tutor.style,
        },
        history: messages.map((m) => ({
          role: m.action === "AI_CHAT_USER" ? "user" : "assistant",
          content: m.metadata?.content,
          pronunciationScore: m.metadata?.pronunciationScore,
          feedback: m.metadata?.feedback,
        })),
      },
    });
  });

  // Chat with AI tutor
  app.post("/ai/chat", async (request, reply) => {
    const user = (request as any).user;
    const { message, language, learningLanguage } = request.body as {
      message: string;
      language: string;
      learningLanguage: string;
    };

    if (!message || !learningLanguage) {
      return reply.status(400).send({
        success: false,
        error: "Message and learning language are required",
      });
    }

    // Check for abusive content
    const abuseCheck = await checkForAbuse(message);
    if (abuseCheck.isAbusive) {
      // Record the abuse
      await recordAbuse(app, user.userId, message, "ai_tutor");

      return reply.status(400).send({
        success: false,
        error: "Please be respectful to the AI tutor",
        warning:
          "This has been recorded. Repeated offenses may result in account restrictions.",
        warningCount: abuseCheck.warningCount,
      });
    }

    const tutor = TUTOR_PERSONAS[learningLanguage] || TUTOR_PERSONAS["en"];

    // Generate AI response (in production, this would call OpenAI/Claude API)
    const response = generateAIResponse(
      message,
      tutor,
      language,
      learningLanguage,
    );

    // Save user message
    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "AI_CHAT_USER",
        entityType: "AIConversation",
        metadata: {
          content: message,
          language: learningLanguage,
          originalLanguage: language,
        },
      },
    });

    // Save AI response
    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "AI_CHAT_ASSISTANT",
        entityType: "AIConversation",
        metadata: {
          content: response,
          language: learningLanguage,
          tutorName: tutor.name,
        },
      },
    });

    return reply.send({
      success: true,
      data: {
        tutor: tutor.name,
        response,
        suggestions: generateSuggestions(learningLanguage),
      },
    });
  });

  // Evaluate pronunciation from audio
  app.post("/ai/pronunciation", async (request, reply) => {
    const user = (request as any).user;
    const { audioUrl, expectedText, language } = request.body as {
      audioUrl: string;
      expectedText: string;
      language: string;
    };

    // Check daily limit for non-premium users
    const hasPremium = await checkAudioPremium(app, user.userId);
    if (!hasPremium) {
      const dailyUsed = await getDailyAudioUsage(app, user.userId);
      if (dailyUsed >= FREE_DAILY_AUDIO_LIMIT) {
        return reply.status(403).send({
          success: false,
          error: "Daily audio transcription limit reached",
          limit: FREE_DAILY_AUDIO_LIMIT,
          used: dailyUsed,
          upgradeUrl: "/subscription/audio-unlimited",
          pricing: AUDIO_TRANSCRIPTION_PRICING,
        });
      }
      // Increment usage
      await incrementAudioUsage(app, user.userId);
    }

    // In production, this would:
    // 1. Send audio to speech-to-text API
    // 2. Compare with expected text
    // 3. Evaluate pronunciation quality
    // For now, we'll simulate the evaluation
    const evaluation = evaluatePronunciation(expectedText, language);

    // Check for abusive content in the text
    const abuseCheck = await checkForAbuse(expectedText);
    if (abuseCheck.isAbusive) {
      await recordAbuse(app, user.userId, expectedText, "audio_pronunciation");
    }

    // Save evaluation
    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "AI_PRONUNCIATION",
        entityType: "AIPronunciation",
        metadata: {
          expectedText,
          language,
          score: evaluation.score,
          feedback: evaluation.feedback,
          phonemes: evaluation.phonemes,
        },
      },
    });

    return reply.send({
      success: true,
      data: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        phonemes: evaluation.phonemes,
        tips: generatePronunciationTips(evaluation, language),
        remainingFree: hasPremium
          ? "unlimited"
          : FREE_DAILY_AUDIO_LIMIT - dailyUsed - 1,
        isPremium: hasPremium,
      },
    });
  });

  // Transcribe audio with optional translation
  app.post("/ai/transcribe", async (request, reply) => {
    const user = (request as any).user;
    const { audioUrl, targetLanguage, audioLanguage } = request.body as {
      audioUrl: string;
      targetLanguage: string;
      audioLanguage: string;
    };

    // Check daily limit for non-premium users
    const hasPremium = await checkAudioPremium(app, user.userId);
    if (!hasPremium) {
      const dailyUsed = await getDailyAudioUsage(app, user.userId);
      if (dailyUsed >= FREE_DAILY_AUDIO_LIMIT) {
        return reply.status(403).send({
          success: false,
          error: "Daily audio transcription limit reached",
          limit: FREE_DAILY_AUDIO_LIMIT,
          used: dailyUsed,
          upgradeUrl: "/subscription/audio-unlimited",
        });
      }
      await incrementAudioUsage(app, user.userId);
    }

    // In production, this would use a speech-to-text API
    // For now, we'll simulate transcription
    const transcription = await transcribeAudio(audioUrl, audioLanguage);

    // Save transcription
    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "AI_TRANSCRIPTION",
        entityType: "AITranscription",
        metadata: {
          originalText: transcription.text,
          originalLanguage: audioLanguage,
          translatedText:
            targetLanguage !== audioLanguage ? transcription.translated : null,
          targetLanguage,
        },
      },
    });

    return reply.send({
      success: true,
      data: {
        original: transcription.text,
        originalLanguage: audioLanguage,
        translated:
          targetLanguage !== audioLanguage ? transcription.translated : null,
        targetLanguage:
          targetLanguage !== audioLanguage ? targetLanguage : null,
        remainingFree: hasPremium
          ? "unlimited"
          : FREE_DAILY_AUDIO_LIMIT -
            (await getDailyAudioUsage(app, user.userId)) -
            1,
        isPremium: hasPremium,
      },
    });
  });

  // Subscribe to unlimited audio
  app.post("/ai/subscribe/audio", async (request, reply) => {
    const user = (request as any).user;
    const { duration } = request.body as {
      duration: "monthly" | "semestral" | "permanent";
    };

    const pricing = AUDIO_TRANSCRIPTION_PRICING[duration];
    const months = pricing.period;
    const expiresAt =
      duration === "permanent"
        ? new Date("2099-12-31")
        : new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);

    // In production, this would integrate with payment gateway

    await app.prisma.user.update({
      where: { id: user.userId },
      data: {
        subscription: "PREMIUM",
        subscriptionExpiresAt: expiresAt,
      },
    });

    await app.prisma.subscription.create({
      data: {
        userId: user.userId,
        type: "PREMIUM",
        duration: duration.toUpperCase(),
        price: pricing.price,
        currency: "USD",
        status: "active",
        expiresAt,
      },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "SUBSCRIPTION_AUDIO_UNLIMITED",
        entityType: "Subscription",
        metadata: { duration },
      },
    });

    return reply.send({
      success: true,
      message: "Audio unlimited subscription activated!",
      data: {
        expiresAt,
        type: "AUDIO_UNLIMITED",
      },
    });
  });

  // Get audio usage status
  app.get("/ai/audio-status", async (request, reply) => {
    const user = (request as any).user;

    const hasPremium = await checkAudioPremium(app, user.userId);
    const dailyUsed = await getDailyAudioUsage(app, user.userId);

    return reply.send({
      success: true,
      data: {
        dailyUsed,
        dailyLimit: FREE_DAILY_AUDIO_LIMIT,
        remaining: hasPremium
          ? "unlimited"
          : Math.max(0, FREE_DAILY_AUDIO_LIMIT - dailyUsed),
        isPremium: hasPremium,
        pricing: hasPremium ? null : AUDIO_TRANSCRIPTION_PRICING,
      },
    });
  });

  // Get warning status for AI interactions
  app.get("/ai/warnings", async (request, reply) => {
    const user = (request as any).user;

    const warnings = await app.prisma.auditLog.count({
      where: {
        userId: user.userId,
        action: "AI_ABUSE",
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    return reply.send({
      success: true,
      data: {
        warningCount: warnings,
        maxWarnings: 3,
        message:
          warnings >= 3
            ? "Your account is at risk. Further abuse may result in restrictions."
            : warnings > 0
              ? `${3 - warnings} more warnings before restrictions.`
              : null,
      },
    });
  });
}

// Helper functions

async function checkForAbuse(
  content: string,
): Promise<{ isAbusive: boolean; warningCount: number }> {
  const abusivePatterns = [
    /\b(stupid|idiot|dumb|moron|asshole|bastard|fuck|shit|damn|hell)\b/gi,
    /\b(you suck|you are|you're so|i hate|i don't like)\b/gi,
  ];

  for (const pattern of abusivePatterns) {
    if (pattern.test(content)) {
      return { isAbusive: true, warningCount: 0 };
    }
  }

  return { isAbusive: false, warningCount: 0 };
}

async function recordAbuse(
  app: FastifyInstance,
  userId: string,
  content: string,
  type: string,
) {
  await app.prisma.auditLog.create({
    data: {
      userId,
      action: "AI_ABUSE",
      entityType: "AIWarning",
      metadata: {
        content: content.substring(0, 100),
        type,
        recordedAt: new Date().toISOString(),
      },
    },
  });
}

async function checkAudioPremium(
  app: FastifyInstance,
  userId: string,
): Promise<boolean> {
  const user = await app.prisma.user.findUnique({
    where: { id: userId },
    select: { subscription: true, subscriptionExpiresAt: true },
  });

  return (
    user?.subscription === "PREMIUM" &&
    (!user.subscriptionExpiresAt ||
      new Date(user.subscriptionExpiresAt) > new Date())
  );
}

async function getDailyAudioUsage(
  app: FastifyInstance,
  userId: string,
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await app.prisma.auditLog.count({
    where: {
      userId,
      action: { in: ["AI_PRONUNCIATION", "AI_TRANSCRIPTION"] },
      createdAt: { gte: today },
    },
  });

  return count;
}

async function incrementAudioUsage(app: FastifyInstance, userId: string) {
  // Usage is tracked via audit logs, no need to update user table
}

function generateAIResponse(
  message: string,
  tutor: any,
  userLanguage: string,
  learningLanguage: string,
): string {
  // In production, this would call OpenAI/Claude API
  // For now, generate contextual responses

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("oi") ||
    lowerMessage.includes("olá")
  ) {
    return `Hello! I'm ${tutor.name}, your ${tutor.language} tutor. 😊\n\nLet's practice together! You can:\n• Send me sentences to correct\n• Ask about grammar\n• Practice conversation\n• Learn new vocabulary\n\nWhat would you like to work on today?`;
  }

  if (
    lowerMessage.includes("help") ||
    lowerMessage.includes("como") ||
    lowerMessage.includes("怎么")
  ) {
    return `I'm here to help you learn ${tutor.language}! Here are some things I can do:\n\n📚 **Practice Conversation** - Chat with me and I'll help correct your ${tutor.language}\n🎯 **Pronunciation** - Send audio and I'll evaluate\n📝 **Grammar** - Ask me questions about grammar rules\n💬 **Vocabulary** - Learn new words and phrases\n\nJust start typing in ${tutor.language} and I'll respond!`;
  }

  return `That's great! In ${tutor.language}, you could say it differently too. Let me give you some tips:\n\n• Try using more natural expressions\n• Practice the pronunciation\n• Don't be afraid to make mistakes!\n\nShall I give you more examples, or would you like to practice with a sentence?`;
}

function generateSuggestions(language: string): string[] {
  const suggestions: Record<string, string[]> = {
    "pt-BR": [
      "Como você está?",
      "Qual é o seu nome?",
      "Onde você mora?",
      "Eu estou aprendendo português",
    ],
    en: [
      "How are you?",
      "What is your name?",
      "Where do you live?",
      "I am learning English",
    ],
    zh: ["你好吗？", "你叫什么名字？", "你住在哪里？", "我在学习中文"],
    ko: [
      "안녕하세요?",
      "이름이 뭐예요?",
      "어디에 살아요?",
      "한국어를 배우고 있어요",
    ],
    ja: [
      "元気ですか？",
      "お名前は何ですか？",
      "どこに、住んでますか？",
      "日本語を勉強しています",
    ],
    ru: ["Как дела?", "Как тебя зовут?", "Где ты живёшь?", "Я учу русский"],
  };

  return suggestions[language] || suggestions["en"];
}

function evaluatePronunciation(
  text: string,
  language: string,
): { score: number; feedback: string; phonemes: any[] } {
  // Simulate pronunciation evaluation
  // In production, use a speech recognition API with pronunciation scoring

  const score = Math.floor(Math.random() * 30) + 70; // 70-100
  const phonemes = text
    .split("")
    .slice(0, 10)
    .map((p, i) => ({
      char: p,
      score: Math.floor(Math.random() * 40) + 60,
      correct: Math.random() > 0.2,
    }));

  let feedback = "";
  if (score >= 90) {
    feedback = "Excellent pronunciation! 🎉";
  } else if (score >= 80) {
    feedback = "Great job! Keep practicing.";
  } else if (score >= 70) {
    feedback = "Good effort! Try to focus on the vowel sounds.";
  } else {
    feedback = "Keep practicing! Listen to native speakers and repeat.";
  }

  return { score, feedback, phonemes };
}

function generatePronunciationTips(
  evaluation: any,
  language: string,
): string[] {
  const tips = [
    "Practice speaking slowly and clearly",
    "Listen to native speakers",
    "Record yourself and compare",
    "Focus on difficult sounds",
  ];

  if (evaluation.score < 80) {
    tips.push("Try breaking words into syllables");
    tips.push("Pay attention to stress patterns");
  }

  return tips;
}

async function transcribeAudio(
  audioUrl: string,
  language: string,
): Promise<{ text: string; translated?: string }> {
  // In production, use a speech-to-text API
  // For now, simulate transcription

  const mockTexts: Record<string, string[]> = {
    "pt-BR": [
      "Olá, como você está?",
      "Bom dia, tudo bem?",
      "Estou aprendendo português",
    ],
    en: [
      "Hello, how are you?",
      "Good morning, how is it going?",
      "I am learning English",
    ],
    zh: ["你好，你好吗？", "早上好！", "我在学习中文"],
    ko: [
      "안녕하세요, 어떻게 있으세요?",
      "좋은 아침!",
      "한국어를 배우고 있어요",
    ],
    ja: [
      "こんにちは、お元気ですか？",
      "おはようございます！",
      "日本語を勉強しています",
    ],
    ru: ["Привет, как дела?", "Доброе утро!", "Я учу русский язык"],
  };

  const texts = mockTexts[language] || mockTexts["en"];
  const text = texts[Math.floor(Math.random() * texts.length)];

  return {
    text,
    translated:
      language !== "en" ? `[Translated to English]: ${text}` : undefined,
  };
}
