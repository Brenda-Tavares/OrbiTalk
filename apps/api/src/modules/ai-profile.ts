import { FastifyInstance } from "fastify";
import { profileCache, aiRateLimit, getCacheKey } from "../lib/cache";

interface GenerateDescriptionRequest {
  name: string;
  interests?: string[];
  languages?: string[];
  country?: string;
  style?: "friendly" | "professional" | "casual";
  locale?: string;
}

const GEMINI_MODEL = "gemini-1.5-flash";

const PROMPT_TEMPLATES: Record<string, string> = {
  "pt-BR": `Você é um assistente de perfil social. Crie uma bio curta e menarik (até 150 caracteres) para {name} de {country}. Interesses: {interests}. Idiomas: {languages}. Estilo: {style}. Retorne apenas a bio, sem aspas.`,
  en: `You are a social profile assistant. Create a short engaging bio (max 150 chars) for {name} from {country}. Interests: {interests}. Languages: {languages}. Style: {style}. Return only the bio, no quotes.`,
  es: `Eres un asistente de perfil social. Crea una biografía corta y atractiva (máx 150 caracteres) para {name} de {country}. Intereses: {interests}. Idiomas: {languages}. Estilo: {style}. Devuelve solo la bio, sin comillas.`,
  zh: `你是一个社交档案助手。为{name}创建一个简短有趣的简介（最多150字符），来自{country}。兴趣：{languages}。语言：{interests}。风格：{style}。只返回简介，不要引号。`,
  ko: `소셜 프로필 도우미입니다. {country} 출신 {name}의 간단하고 매력적인bio를 만들어주세요 (최대 150자). 관심사: {interests}. 언어: {languages}. 스타일: {style}. bio만 반환, 인용 부호 제외.`,
  ja: `ソーシャルプロフィールアシスタントです。{country}出身{name}のための短くて魅力的なプロフィール説明（最大150文字）を作成してください。興味：{interests}。言語：{languages}。スタイル：{style}。説明のみを返し、引用符はしないでください。`,
  ru: `Вы помощник по профилю в социальных сетях. Создайте короткую интересную биографию (макс 150 символов) для {name} из {country}. Интересы: {interests}. Языки: {languages}. Стиль: {style}. Верните только биографию, без кавычек.`,
};

async function generateWithGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}

function generateFallbackDescription(data: GenerateDescriptionRequest): string {
  const { name, interests = [], languages = [], country = "" } = data;
  const parts: string[] = [];

  if (interests.length > 0) {
    parts.push(`❤️ ${interests.slice(0, 3).join(", ")}`);
  }

  if (languages.length > 0) {
    parts.push(`🌍 ${languages.join(", ")}`);
  }

  if (country) {
    parts.push(`📍 ${country}`);
  }

  return parts.length > 0
    ? `${name} - ${parts.join(" | ")}`
    : `Hi! I'm ${name}! 👋`;
}

export async function generateProfileDescription(
  data: GenerateDescriptionRequest,
  userId?: string,
): Promise<{
  description: string;
  aiGenerated: boolean;
  suggestions?: string[];
}> {
  const cacheKey = getCacheKey(
    "profile",
    data.name,
    data.locale || "en",
    (data.interests || []).join(","),
  );
  const cached = profileCache.get<{
    description: string;
    aiGenerated: boolean;
    suggestions?: string[];
  }>(cacheKey);
  if (cached) {
    return cached;
  }

  if (userId && !aiRateLimit.check(userId)) {
    return {
      description: generateFallbackDescription(data),
      aiGenerated: false,
      message: "Rate limit exceeded. Please try again later.",
    };
  }

  const locale = data.locale || "en";
  const template = PROMPT_TEMPLATES[locale] || PROMPT_TEMPLATES.en;

  const prompt = template
    .replace("{name}", data.name)
    .replace("{country}", data.country || "World")
    .replace("{interests}", data.interests?.join(", ") || "various topics")
    .replace("{languages}", data.languages?.join(", ") || "multiple languages")
    .replace("{style}", data.style || "friendly");

  const aiDescription = await generateWithGemini(prompt);

  const result = aiDescription
    ? {
        description: aiDescription.substring(0, 150),
        aiGenerated: true,
        suggestions: [aiDescription, generateFallbackDescription(data)],
      }
    : {
        description: generateFallbackDescription(data),
        aiGenerated: false,
      };

  profileCache.set(cacheKey, result, 600);

  return result;
}

export async function aiProfileModule(app: FastifyInstance) {
  app.post<{ Body: GenerateDescriptionRequest }>(
    "/api/ai/profile-description",
    async (request, reply) => {
      const { name, interests, languages, country, style, locale } =
        request.body;

      if (!name || name.length < 2) {
        return reply.status(400).send({
          success: false,
          error: "Name is required",
        });
      }

      const result = await generateProfileDescription({
        name,
        interests,
        languages,
        country,
        style,
        locale,
      });

      return reply.send({
        success: true,
        data: result,
      });
    },
  );

  app.get("/api/ai/status", async () => {
    const hasApiKey = !!process.env.GEMINI_API_KEY;

    return {
      success: true,
      data: {
        status: hasApiKey ? "ready" : "api_key_required",
        service: "Google Gemini 1.5 Flash",
        features: ["profile_description", "ai_tutor", "translation"],
        message: hasApiKey
          ? "AI features are ready to use"
          : "Set GEMINI_API_KEY in .env to enable AI features",
      },
    };
  });
}
