import { FastifyInstance } from "fastify";
import { aiRateLimit, getCacheKey, profileCache } from "../lib/cache";

interface CompanionMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface CompanionSession {
  sessionId: string;
  userId: string;
  messages: CompanionMessage[];
  lastActivity: number;
}

const COMPANION_PROMPTS: Record<string, string> = {
  pt: `Você é um companheiro de apoio do OrbiTalk. Seu papel é:
- Ouvir e entender os sentimentos do usuário
- Oferecer suporte emocional genuíno
- Ajudar a processar experiências difíceis
- Fornecer recursos e orientações quando apropriado
- Nunca julgue, sempre valide os sentimentos

Mantenha respostas curtas (máx 200 palavras), empáticas e úteis.
Se o usuário estiver em perigo ou precisar de ajuda profissional, oriente a buscar ajuda.`,
  en: `You are a companion support from OrbiTalk. Your role is:
- Listen and understand user's feelings
- Offer genuine emotional support
- Help process difficult experiences
- Provide resources and guidance when appropriate
- Never judge, always validate feelings

Keep responses short (max 200 words), empathetic and helpful.
If user is in danger or needs professional help, guide them to seek help.`,
  es: `Eres un compañero de apoyo de OrbiTalk. Tu rol es:
- Escuchar y entender los sentimientos del usuario
- Ofrecer apoyo emocional genuino
- Ayudar a procesar experiencias difíciles
- Proporcionar recursos y orientación cuando sea apropiado
- Nunca juzgues, siempre valida los sentimientos`,
  zh: `你是OrbiTalk的支持伙伴。你的角色是：
- 倾听并理解用户的感受
- 提供真正的情感支持
- 帮助处理困难经历
- 在适当时提供资源和指导
- 永远不要评判，始终验证感受`,
  ko: `당신은 OrbiTalk의 지원 동반자입니다. 당신의 역할은:
- 사용자의 감정을 듣고 이해하기
- 진정한 정서적 지원 제공
- 어려운 경험을 처리하는 데 도움주기
- 적절할 때 자원 및 안내 제공
- 판단하지 않고 항상 감정 검증하기`,
  ja: `你是OrbiTalkのサポートコンパニオンです。あなたの役割は：
- ユーザーの気持ちを聞いて理解する
- 本物の感情的サポートを提供する
- 困難な経験を處理するのを助ける
- 適切なときにリソースとガイダンスを提供する
- 判断せず、常に感情を検証する`,
  ru: `Вы - компаньон поддержки OrbiTalk. Ваша роль:
- Слушать и понимать чувства пользователя
- Предлагать искреннюю эмоциональную поддержку
- Помогать обрабатывать трудный опыт
- Предоставлять ресурсы и рекомендации когда уместно
- Никогда не судить, всегда подтверждать чувства`,
};

const sessions = new Map<string, CompanionSession>();

function createSession(userId: string): CompanionSession {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const session: CompanionSession = {
    sessionId,
    userId,
    messages: [],
    lastActivity: Date.now(),
  };
  sessions.set(sessionId, session);
  return session;
}

function getOrCreateSession(userId: string): CompanionSession {
  let session = Array.from(sessions.values()).find((s) => s.userId === userId);
  if (!session || Date.now() - session.lastActivity > 3600000) {
    session = createSession(userId);
  }
  session.lastActivity = Date.now();
  return session;
}

export async function sendToCompanion(
  userId: string,
  message: string,
  locale: string = "en",
): Promise<{ response: string; sessionId: string; suggestions?: string[] }> {
  const session = getOrCreateSession(userId);

  session.messages.push({
    role: "user",
    content: message,
    timestamp: Date.now(),
  });

  const recentMessages = session.messages.slice(-10);

  const systemPrompt = COMPANION_PROMPTS[locale] || COMPANION_PROMPTS.en;

  const apiKey = process.env.GEMINI_API_KEY;
  let aiResponse: string | null = null;

  if (apiKey) {
    try {
      const conversation = [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...recentMessages.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: conversation,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        },
      );

      const data = await response.json();
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      console.error("Companion AI error:", error);
    }
  }

  if (!aiResponse) {
    aiResponse = getFallbackResponse(message, locale);
  }

  session.messages.push({
    role: "assistant",
    content: aiResponse,
    timestamp: Date.now(),
  });

  const suggestions = getSuggestionsForResponse(aiResponse, locale);

  return {
    response: aiResponse,
    sessionId: session.sessionId,
    suggestions,
  };
}

function getFallbackResponse(message: string, locale: string): string {
  const fallbackResponses: Record<string, string[]> = {
    pt: [
      "Entendo. Conte-me mais sobre como você está se sentindo.",
      "Isso parece difícil. Como isso está afetando você?",
      "Obrigado por compartilhar. O que você gostaria de fazer agora?",
    ],
    en: [
      "I understand. Tell me more about how you're feeling.",
      "This seems difficult. How is this affecting you?",
      "Thank you for sharing. What would you like to do now?",
    ],
  };

  const responses = fallbackResponses[locale] || fallbackResponses.en;
  return responses[Math.floor(Math.random() * responses.length)];
}

function getSuggestionsForResponse(response: string, locale: string): string[] {
  const baseSuggestions: Record<string, string[]> = {
    pt: [
      "Quero fazer um report",
      "Quero conversar mais",
      "Preciso de ajuda",
      "Obrigado pela conversa",
    ],
    en: [
      "I want to make a report",
      "I want to talk more",
      "I need help",
      "Thanks for the conversation",
    ],
  };

  return baseSuggestions[locale] || baseSuggestions.en;
}

export async function companionModule(app: FastifyInstance) {
  app.post<{ Body: { userId: string; message: string; locale?: string } }>(
    "/api/companion/chat",
    async (request, reply) => {
      const { userId, message, locale } = request.body;

      if (!userId || !message) {
        return reply.status(400).send({
          success: false,
          error: "userId and message are required",
        });
      }

      if (!aiRateLimit.check(userId)) {
        return reply.status(429).send({
          success: false,
          error: "Too many messages. Please wait a moment.",
        });
      }

      try {
        const result = await sendToCompanion(userId, message, locale || "en");

        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        console.error("Companion error:", error);
        return reply.status(500).send({
          success: false,
          error: "Failed to get response",
        });
      }
    },
  );

  app.post<{ Body: { userId: string; reason: string; context?: string } }>(
    "/api/companion/pre-report",
    async (request, reply) => {
      const { userId, reason, context } = request.body;

      if (!userId || !reason) {
        return reply.status(400).send({
          success: false,
          error: "userId and reason are required",
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      let analysis: {
        category: string;
        severity: string;
        guidance: string;
      } | null = null;

      if (apiKey) {
        try {
          const prompt = `O usuário está buscando ajuda para fazer um report. 
Motivo: ${reason}
Contexto adicional: ${context || "não fornecido"}

Analise e categorize o problema. Retorne em JSON:
{
  "category": "categoria do report (harassment, inappropriate_content, scam, spam, threat, other)",
  "severity": "baixa, media, alta, critica",
  "guidance": "orientação breve para o usuário sobre como proceder"
}
Retorne apenas o JSON.`;

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
              }),
            },
          );

          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (text) {
            try {
              analysis = JSON.parse(text.replace(/```json|```/g, ""));
            } catch {
              analysis = null;
            }
          }
        } catch (error) {
          console.error("Pre-report analysis error:", error);
        }
      }

      if (!analysis) {
        analysis = {
          category: "other",
          severity: "media",
          guidance:
            "Descreva o que aconteceu para que possamos ajudá-lo corretamente.",
        };
      }

      return reply.send({
        success: true,
        data: {
          suggestedCategory: analysis.category,
          severity: analysis.severity,
          guidance: analysis.guidance,
          question: reason,
        },
      });
    },
  );

  app.delete<{ Params: { userId: string } }>(
    "/api/companion/session/:userId",
    async (request, reply) => {
      const { userId } = request.params;

      const userSessions = Array.from(sessions.values()).filter(
        (s) => s.userId === userId,
      );
      userSessions.forEach((s) => sessions.delete(s.sessionId));

      return reply.send({
        success: true,
        message: "Session cleared",
      });
    },
  );
}
