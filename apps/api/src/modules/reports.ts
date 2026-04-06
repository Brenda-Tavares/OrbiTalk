import { FastifyInstance } from "fastify";

const REPORT_CATEGORIES: Record<
  string,
  { id: string; name: string; severity: string }[]
> = {
  "pt-BR": [
    { id: "harassment", name: "Assédio", severity: "high" },
    {
      id: "inappropriate_content",
      name: "Conteúdo Impróprio",
      severity: "high",
    },
    { id: "spam", name: "Spam", severity: "low" },
    { id: "scam", name: "Golpe/Scam", severity: "critical" },
    { id: "threat", name: "Ameaça", severity: "critical" },
    { id: "underage", name: "Menor de Idade", severity: "critical" },
    { id: "fake_profile", name: "Perfil Falso", severity: "medium" },
    { id: "inappropriate_photo", name: "Foto Inadequada", severity: "medium" },
    { id: "other", name: "Outro", severity: "medium" },
  ],
  en: [
    { id: "harassment", name: "Harassment", severity: "high" },
    {
      id: "inappropriate_content",
      name: "Inappropriate Content",
      severity: "high",
    },
    { id: "spam", name: "Spam", severity: "low" },
    { id: "scam", name: "Scam/Fraud", severity: "critical" },
    { id: "threat", name: "Threat", severity: "critical" },
    { id: "underage", name: "Underage User", severity: "critical" },
    { id: "fake_profile", name: "Fake Profile", severity: "medium" },
    {
      id: "inappropriate_photo",
      name: "Inappropriate Photo",
      severity: "medium",
    },
    { id: "other", name: "Other", severity: "medium" },
  ],
  zh: [
    { id: "harassment", name: "骚扰", severity: "high" },
    { id: "inappropriate_content", name: "不当内容", severity: "high" },
    { id: "spam", name: "垃圾信息", severity: "low" },
    { id: "scam", name: "诈骗", severity: "critical" },
    { id: "threat", name: "威胁", severity: "critical" },
    { id: "underage", name: "未成年用户", severity: "critical" },
    { id: "fake_profile", name: "虚假档案", severity: "medium" },
    { id: "inappropriate_photo", name: "不当照片", severity: "medium" },
    { id: "other", name: "其他", severity: "medium" },
  ],
  es: [
    { id: "harassment", name: "Acoso", severity: "high" },
    {
      id: "inappropriate_content",
      name: "Contenido Inadecuado",
      severity: "high",
    },
    { id: "spam", name: "Spam", severity: "low" },
    { id: "scam", name: "Estafa", severity: "critical" },
    { id: "threat", name: "Amenaza", severity: "critical" },
    { id: "underage", name: "Menor de Edad", severity: "critical" },
    { id: "fake_profile", name: "Perfil Falso", severity: "medium" },
    { id: "inappropriate_photo", name: "Foto Inadecuada", severity: "medium" },
    { id: "other", name: "Otro", severity: "medium" },
  ],
  ko: [
    { id: "harassment", name: "괴롭힘", severity: "high" },
    { id: "inappropriate_content", name: "부적절한 콘텐츠", severity: "high" },
    { id: "spam", name: "스팸", severity: "low" },
    { id: "scam", name: "사기", severity: "critical" },
    { id: "threat", name: "협박", severity: "critical" },
    { id: "underage", name: "미성년자", severity: "critical" },
    { id: "fake_profile", name: "가짜 프로필", severity: "medium" },
    { id: "inappropriate_photo", name: "부적절한 사진", severity: "medium" },
    { id: "other", name: "기타", severity: "medium" },
  ],
  ja: [
    { id: "harassment", name: "ハラスメント", severity: "high" },
    {
      id: "inappropriate_content",
      name: "不適切なコンテンツ",
      severity: "high",
    },
    { id: "spam", name: "スパム", severity: "low" },
    { id: "scam", name: "詐欺", severity: "critical" },
    { id: "threat", name: "脅威", severity: "critical" },
    { id: "underage", name: "未成年ユーザー", severity: "critical" },
    { id: "fake_profile", name: "偽のプロフィール", severity: "medium" },
    { id: "inappropriate_photo", name: "不適切な写真", severity: "medium" },
    { id: "other", name: "その他", severity: "medium" },
  ],
  ru: [
    { id: "harassment", name: "Преследование", severity: "high" },
    {
      id: "inappropriate_content",
      name: "Неприемлемый контент",
      severity: "high",
    },
    { id: "spam", name: "Спам", severity: "low" },
    { id: "scam", name: "Мошенничество", severity: "critical" },
    { id: "threat", name: "Угроза", severity: "critical" },
    { id: "underage", name: "Несовершеннолетний", severity: "critical" },
    { id: "fake_profile", name: "Фальшивый профиль", severity: "medium" },
    {
      id: "inappropriate_photo",
      name: "Неприемлемое фото",
      severity: "medium",
    },
    { id: "other", name: "Другое", severity: "medium" },
  ],
};

const MESSAGES = {
  "pt-BR": {
    success: "Report enviado. Vamos analisar em breve.",
    error: "Erro ao enviar report",
    selfReport: "Você não pode reportar você mesmo",
  },
  en: {
    success: "Report submitted. We'll review shortly.",
    error: "Error submitting report",
    selfReport: "You cannot report yourself",
  },
  zh: {
    success: "举报已提交。我们将很快审核。",
    error: "提交举报时出错",
    selfReport: "您不能举报自己",
  },
  es: {
    success: "Report enviado. Lo revisaremos pronto.",
    error: "Error al enviar report",
    selfReport: "No puedes reportarte a ti mismo",
  },
  ko: {
    success: "신고가 제출되었습니다. 곧 검토하겠습니다.",
    error: "신고 제출 오류",
    selfReport: "자기 자신을 신고할 수 없습니다",
  },
  ja: {
    success: "レポートは提出されました。まもなく審査します。",
    error: "レポート提出エラー",
    selfReport: "自分をレポートできません",
  },
  ru: {
    success: "Жалоба отправлена. Мы скоро рассмотрим.",
    error: "Ошибка отправки жалобы",
    selfReport: "Вы не можете пожаловаться на себя",
  },
};

function getCategories(locale: string) {
  return REPORT_CATEGORIES[locale] || REPORT_CATEGORIES.en;
}

function getMessage(locale: string, key: keyof typeof MESSAGES.en) {
  return MESSAGES[locale as keyof typeof MESSAGES]?.[key] || MESSAGES.en[key];
}

export async function reportsModule(app: FastifyInstance) {
  app.post<{
    Body: {
      reporterId: string;
      reportedId: string;
      category: string;
      description: string;
    };
  }>("/api/reports/create", async (request, reply) => {
    const { reporterId, reportedId, category, description } = request.body;

    if (!reporterId || !reportedId || !category || !description) {
      return reply.status(400).send({
        success: false,
        error: "reporterId, reportedId, category and description are required",
      });
    }

    if (reporterId === reportedId) {
      return reply.status(400).send({
        success: false,
        error: "You cannot report yourself",
      });
    }

    try {
      const report = await app.prisma.report.create({
        data: {
          reporterId,
          reportedId,
          reason: category,
          description,
          country: "BR",
          status: "pending",
        },
      });

      return reply.status(201).send({
        success: true,
        data: {
          reportId: report.id,
          status: report.status,
          message: "Report submitted. We'll review shortly.",
        },
      });
    } catch (error) {
      console.error("Report error:", error);
      return reply
        .status(500)
        .send({ success: false, error: "Failed to create report" });
    }
  });

  app.post<{
    Body: { reporterId: string; message: string; categoryHint?: string };
  }>("/api/reports/analyze", async (request, reply) => {
    const { message, categoryHint } = request.body;

    let analysis = {
      category: "other",
      severity: "media",
      guidance: "Descreva o que aconteceu.",
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Analise: "${message}". Categoria sugerida: ${categoryHint || "none"}. JSON: {"category": "harassment|inappropriate_content|spam|scam|threat|underage|fake_profile|other", "severity": "baixa|media|alta", "guidance": "..."}`;

        const requestBody = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 100 },
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          },
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text)
          analysis = JSON.parse(text.replace(/```json|```/g, "").trim());
      } catch (e) {
        console.error("AI analysis error:", e);
      }
    }

    const locale = request.body?.locale || "en";
    const categories = getCategories(locale);
    const cat = categories.find((c) => c.id === analysis.category);

    return reply.send({
      success: true,
      data: {
        suggestedCategory: analysis.category,
        suggestedLabel: cat?.name || "Outro",
        severity: analysis.severity,
        guidance: analysis.guidance,
        categories,
      },
    });
  });

  app.get<{ Params: { userId: string } }>(
    "/api/reports/user/:userId",
    async (request, reply) => {
      const { userId } = request.params;
      try {
        const reports = await app.prisma.report.findMany({
          where: { OR: [{ reporterId: userId }, { reportedId: userId }] },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
        return reply.send({ success: true, data: { reports } });
      } catch (error) {
        return reply
          .status(500)
          .send({ success: false, error: "Failed to fetch reports" });
      }
    },
  );

  app.get("/api/reports/categories", async () => {
    return { success: true, data: REPORT_CATEGORIES };
  });

  app.post<{ Body: { userId: string; blockedId: string; reason?: string } }>(
    "/api/reports/block",
    async (request, reply) => {
      const { userId, blockedId, reason } = request.body;
      if (!userId || !blockedId || userId === blockedId) {
        return reply
          .status(400)
          .send({ success: false, error: "Invalid request" });
      }
      try {
        await app.prisma.report.create({
          data: {
            reporterId: userId,
            reportedId: blockedId,
            reason: "block",
            description: reason || "User blocked",
            country: "BR",
          },
        });
        return reply.send({ success: true, data: { message: "User blocked" } });
      } catch (error) {
        return reply
          .status(500)
          .send({ success: false, error: "Failed to block" });
      }
    },
  );

  app.delete<{ Params: { userId: string; blockedId: string } }>(
    "/api/reports/unblock/:userId/:blockedId",
    async (request, reply) => {
      const { userId, blockedId } = request.params;
      try {
        await app.prisma.report.deleteMany({
          where: { reporterId: userId, reportedId: blockedId, reason: "block" },
        });
        return reply.send({
          success: true,
          data: { message: "User unblocked" },
        });
      } catch (error) {
        return reply
          .status(500)
          .send({ success: false, error: "Failed to unblock" });
      }
    },
  );
}
