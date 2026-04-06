import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Regras e termos traduzidos por idioma
export const RULES_BY_LANGUAGE: Record<string, { title: string; sections: { title: string; content: string[] }[] }> = {
  'pt-BR': {
    title: 'Termos e Regras do OrbiTalk',
    sections: [
      {
        title: 'Consentimento e Respeito',
        content: [
          '• Todo conteúdo e interação requer consentimento mútuo.',
          '• Respeite os limites de outros usuários.',
          '• Assédio, ameaças ou coerção resultam em banimento permanente.',
          '• Compartilhamento não consensual de conteúdo é crime.',
        ],
      },
      {
        title: 'Verificação de Identidade',
        content: [
          '• A verificação é obrigatória para garantir sua segurança.',
          '• Confirmamos que você é quem diz ser.',
          '• Isso previne fakes, golpes e roubo de identidade.',
          '• Seus documentos são criptografados e excluídos após verificação.',
          '• Menores de 18 anos não são permitidos.',
        ],
      },
      {
        title: 'Proteção contra Golpes',
        content: [
          '• NUNCA envie dinheiro para pessoas que conhecer online.',
          '• Golpistas frequentemente pedem transferência, PIX ou cartões.',
          '• Se alguém pedir dinheiro, você será notificado sobre possível golpe.',
          '• Denuncie e bloqueie imediatamente qualquer tentativa de golpe.',
        ],
      },
      {
        title: 'Condições para Banimento',
        content: [
          '🔴 BANIMENTO IMEDIATO (sem aviso):',
          '• Detecção de menor de idade',
          '• Conteúdo sexual envolvendo menores',
          '• Ameaças de morte ou violência',
          '• Perfil falso para enganar outros',
          '• Compartilhamento não consensual de conteúdo íntimo',
          '',
          '🟡 AVISO + LIMITAÇÃO (depois banimento):',
          '• Primeira infração: Aviso + limitado a 4 conversas por 24h',
          '• Segunda infração: Novo aviso + mais 24h de limitação',
          '• Terceira infração: Banimento permanente',
          '• Exemplos: Assédio leve, desrespeito, insistência excessiva',
        ],
      },
      {
        title: 'Seus Dados (LGPD)',
        content: [
          '• Seus dados são protegidos pela LGPD.',
          '• Você pode exportar ou excluir seus dados a qualquer momento.',
          '• Seus documentos são excluídos 24h após verificação.',
          '• Você controla quem pode ver seu perfil e status online.',
        ],
      },
      {
        title: 'Denúncias',
        content: [
          '• Use o botão de denúncia em qualquer mensagem ou perfil.',
          '• Denúncias são analisadas por IA e revisores humanos.',
          '• Você receberá orientações legais conforme seu país.',
          '• Chat pode ser usado como prova judicial (autenticado).',
        ],
      },
    ],
  },
  en: {
    title: 'OrbiTalk Terms and Rules',
    sections: [
      {
        title: 'Consent and Respect',
        content: [
          '• All content and interaction requires mutual consent.',
          '• Respect other users\' limits.',
          '• Harassment, threats or coercion result in permanent ban.',
          '• Non-consensual sharing of content is a crime.',
        ],
      },
      {
        title: 'Identity Verification',
        content: [
          '• Verification is mandatory to ensure your safety.',
          '• We confirm you are who you claim to be.',
          '• This prevents fakes, scams and identity theft.',
          '• Your documents are encrypted and deleted after verification.',
          '• Users under 18 are not allowed.',
        ],
      },
      {
        title: 'Scam Protection',
        content: [
          '• NEVER send money to people you meet online.',
          '• Scammers often ask for transfers, PIX or gift cards.',
          '• If someone asks for money, you will be notified of potential scam.',
          '• Report and block immediately any scam attempt.',
        ],
      },
      {
        title: 'Ban Conditions',
        content: [
          '🔴 IMMEDIATE BAN (no warning):',
          '• Detection of minor',
          '• Sexual content involving minors',
          '• Death threats or violence',
          '• Fake profile to deceive others',
          '• Non-consensual sharing of intimate content',
          '',
          '🟡 WARNING + LIMITATION (then ban):',
          '• First offense: Warning + limited to 4 chats for 24h',
          '• Second offense: New warning + another 24h limitation',
          '• Third offense: Permanent ban',
          '• Examples: Light harassment, disrespect, excessive insistence',
        ],
      },
      {
        title: 'Your Data (GDPR/CCPA)',
        content: [
          '• Your data is protected by privacy laws.',
          '• You can export or delete your data anytime.',
          '• Documents are deleted 24h after verification.',
          '• You control who can see your profile and online status.',
        ],
      },
    ],
  },
  zh: {
    title: 'OrbiTalk 服务条款',
    sections: [
      {
        title: '同意与尊重',
        content: [
          '• 所有内容和互动都需要双方同意。',
          '• 尊重他人的界限。',
          '• 骚扰、威胁或胁迫将导致永久封禁。',
          '• 未经同意分享内容是违法行为。',
        ],
      },
      {
        title: '身份验证',
        content: [
          '• 验证是强制性的，以确保您的安全。',
          '• 我们确认您是您所声称的人。',
          '• 这可以防止虚假、诈骗和身份盗窃。',
          '• 您的文件在验证后会被加密删除。',
          '• 18岁以下用户不允许注册。',
        ],
      },
      {
        title: '诈骗保护',
        content: [
          '• 永远不要向网上认识的人汇款。',
          '• 诈骗者经常要求转账或充值。',
          '• 如果有人要钱，您将收到诈骗风险通知。',
          '• 请立即举报和屏蔽任何诈骗企图。',
        ],
      },
      {
        title: '封禁条件',
        content: [
          '🔴 即时封禁（无警告）：',
          '• 检测到未成年',
          '• 涉及未成年人的色情内容',
          '• 死亡威胁或暴力',
          '• 虚假个人资料',
          '• 未经同意分享私密内容',
          '',
          '🟡 警告+限制（之后封禁）：',
          '• 第一次违规：警告+限制聊天4个对话24小时',
          '• 第二次违规：再次警告+再限制24小时',
          '• 第三次违规：永久封禁',
        ],
      },
    ],
  },
  ko: {
    title: 'OrbiTalk 약관 및 규칙',
    sections: [
      {
        title: '동의와 존중',
        content: [
          '• 모든 콘텐츠와 상호작용은 상호 동의가 필요합니다.',
          '• 다른 사용자의 한계를 존중하세요.',
          '• 희롱, 위협 또는 강압은 영구 차단으로 이어집니다.',
          '• 동의 없는 콘텐츠 공유는 범죄입니다.',
        ],
      },
      {
        title: '신원 확인',
        content: [
          '• 확인은 안전을 위해 필수입니다.',
          '• 우리는 당신이 주장하는 사람이 맞는지 확인합니다.',
          '• 이는 사기, 사기꾼, 신원 도용을 방지합니다.',
          '• 문서는 확인 후 암호화되어 삭제됩니다.',
          '• 18세 미만은 허용되지 않습니다.',
        ],
      },
    ],
  },
  ja: {
    title: 'OrbiTalk 利用規約',
    sections: [
      {
        title: '同意と尊重',
        content: [
          '• すべてのコンテンツと交流には相互の同意が必要です。',
          '• 他のユーザーの限界を尊重してください。',
          '• ハラスメント、脅迫、強要は永久BANになります。',
          '• 同意のないコンテンツ共有は犯罪です。',
        ],
      },
      {
        title: '本人確認',
        content: [
          '• 確認はあなたの安全を確保するために必須です。',
          '• あなたが主張する本人であることを確認します。',
          '• これにより偽造、詐欺、なりすましが防止されます。',
          '• ドキュメントは確認後に暗号化され削除されます。',
          '• 18歳未満は許可されません。',
        ],
      },
    ],
  },
  ru: {
    title: 'Правила OrbiTalk',
    sections: [
      {
        title: 'Согласие и уважение',
        content: [
          '• Весь контент и взаимодействие требует взаимного согласия.',
          '• Уважайте границы других пользователей.',
          '• Преследование, угрозы или принуждение ведут к постоянному бану.',
          '• Распространение контента без согласия — преступление.',
        ],
      },
      {
        title: 'Подтверждение личности',
        content: [
          '• Подтверждение обязательно для вашей безопасности.',
          '• Мы подтверждаем, что вы тот, за кого себя выдаёте.',
          '• Это предотвращает фейки, мошенничество и кражу личности.',
          '• Документы шифруются и удаляются после проверки.',
          '• Пользователи младше 18 лет не допускаются.',
        ],
      },
    ],
  },
  yue: {
    title: 'OrbiTalk 服務條款',
    sections: [
      {
        title: '同意與尊重',
        content: [
          '• 所有內容和互動都需要雙方同意。',
          '• 尊重他人的界線。',
          '• 騷擾、威脅或強迫會導致永久封禁。',
          '• 未經同意分享內容是違法行為。',
        ],
      },
    ],
  },
};

export const DEFAULT_RULES = RULES_BY_LANGUAGE['en'];

export function getRulesByLanguage(lang: string) {
  return RULES_BY_LANGUAGE[lang] || RULES_BY_LANGUAGE['en'];
}

export async function consentModule(app: FastifyInstance) {
  // Get rules by language
  app.get('/rules', async (request, reply) => {
    const { lang } = request.query as { lang?: string };
    const language = lang || 'en';
    const rules = getRulesByLanguage(language);

    return reply.send({
      success: true,
      data: rules,
    });
  });

  // Accept rules during registration
  app.post('/rules/accept', async (request, reply) => {
    const user = (request as any).user;
    const { accepted } = request.body as { accepted: boolean };

    if (!accepted) {
      return reply.status(400).send({
        success: false,
        error: 'You must accept the rules to continue',
      });
    }

    await app.prisma.user.update({
      where: { id: user.userId },
      data: { 
        termsAcceptedAt: new Date(),
      },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'TERMS_ACCEPTED',
        entityType: 'User',
        entityId: user.userId,
      },
    });

    return reply.send({
      success: true,
      message: 'Terms accepted',
    });
  });

  // Get user's warning/ban history (for their own view)
  app.get('/my-warnings', async (request, reply) => {
    const user = (request as any).user;

    const warnings = await app.prisma.moderation.findMany({
      where: {
        targetUserId: user.userId,
        action: { in: ['warning', 'temp_ban'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const bans = await app.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        isBanned: true,
        banPermanent: true,
        banReason: true,
        warningCount: true,
      },
    });

    return reply.send({
      success: true,
      data: {
        warnings,
        banStatus: bans,
      },
    });
  });

  // Get public warning info for male users (visible on profile)
  app.get('/user/:userId/warning-info', async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const targetUser = await app.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        genderIdentity: true,
        reportedHarassments: true,
        warningCount: true,
        isBanned: true,
      },
    });

    if (!targetUser) {
      return reply.status(404).send({
        success: false,
        error: 'User not found',
      });
    }

    // Only show detailed info for male users (men, or prefer not to answer who are connected with men)
    const showDetailedInfo = 
      targetUser.genderIdentity === 'MAN' || 
      (targetUser.genderIdentity === 'PREFER_NOT_TO_ANSWER');

    if (!showDetailedInfo) {
      return reply.send({
        success: true,
        data: {
          hasWarnings: targetUser.warningCount > 0 || targetUser.isBanned,
          showDetails: false,
        },
      });
    }

    // Get warning count in last 30 days
    const recentWarnings = await app.prisma.moderation.count({
      where: {
        targetUserId: userId,
        action: 'warning',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    // Check if currently limited
    const activeLimitation = await app.prisma.moderation.findFirst({
      where: {
        targetUserId: userId,
        action: 'chat_limited',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      success: true,
      data: {
        hasWarnings: targetUser.warningCount > 0,
        warningCount: targetUser.warningCount,
        recentWarnings,
        harassmentReports: targetUser.reportedHarassments,
        isBanned: targetUser.isBanned,
        isCurrentlyLimited: !!activeLimitation,
        limitationExpiresAt: activeLimitation?.createdAt 
          ? new Date(activeLimitation.createdAt.getTime() + 24 * 60 * 60 * 1000) 
          : null,
        showDetails: true,
        userNickname: targetUser.genderIdentity === 'MAN' || targetUser.genderIdentity === 'PREFER_NOT_TO_ANSWER' 
          ? (await app.prisma.user.findUnique({ where: { id: userId }, select: { nickname: true } }))?.nickname 
          : null,
        message: 'This user has received warnings for rule violations. Be cautious.',
      },
    });
  });

  // Issue warning with limitation
  app.post('/warn/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { reason } = request.body as { reason: string };

    const user = await app.prisma.user.update({
      where: { id: userId },
      data: { warningCount: { increment: 1 } },
    });

    // Create moderation record
    await app.prisma.moderation.create({
      data: {
        moderatorId: 'SYSTEM',
        targetUserId: userId,
        action: user.warningCount >= 3 ? 'permanent_ban' : 'warning',
        reason,
      },
    });

    // If 3+ warnings, ban permanently
    if (user.warningCount >= 3) {
      await app.prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          banPermanent: true,
          banReason: 'MULTIPLE_WARNINGS',
        },
      });

      await app.prisma.notification.create({
        data: {
          userId,
          type: 'PERMANENT_BAN',
          title: 'Account Permanently Banned',
          body: `You have been permanently banned due to ${user.warningCount} rule violations.`,
        },
      });
    } else {
    // Apply limitation
    const targetUserData = await app.prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true, tag: true },
    });

    await app.prisma.moderation.create({
      data: {
        moderatorId: 'SYSTEM',
        targetUserId: userId,
        action: 'chat_limited',
        reason: `Warning ${user.warningCount}/3 - Limited to 4 chats for 24h`,
      },
    });

    const limitationEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await app.prisma.notification.create({
      data: {
        userId,
        type: 'SAFETY_WARNING',
        title: `Aviso ${user.warningCount}/3 - Acesso Limitado`,
        body: `${targetUserData.nickname}#${targetUserData.tag}, você recebeu um aviso. Seu acesso ao chat agora está limitado a 4 conversas por 24 horas. Após 3 avisos, sua conta será banida permanentemente.`,
        data: { 
          warningNumber: user.warningCount,
          limitedUntil: limitationEndTime.toISOString(),
          limit: 4,
        },
      },
    });
    }

    return reply.send({
      success: true,
      message: user.warningCount >= 3 
        ? 'User permanently banned' 
        : `Warning issued. User limited to 4 chats for 24h. (${user.warningCount}/3 warnings)`,
    });
  });

  // Check if user is limited (used before sending messages)
  app.get('/check-limit', async (request, reply) => {
    const user = (request as any).user;

    const recentLimitation = await app.prisma.moderation.findFirst({
      where: {
        targetUserId: user.userId,
        action: 'chat_limited',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!recentLimitation) {
      return reply.send({
        success: true,
        data: { isLimited: false, limit: Infinity },
      });
    }

    // Count active chats
    const activeChats = await app.prisma.chatParticipant.count({
      where: {
        userId: user.userId,
        chat: {
          updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      },
    });

    const isLimited = activeChats >= 4;

    return reply.send({
      success: true,
      data: {
        isLimited,
        currentChats: activeChats,
        limit: 4,
        expiresAt: new Date(recentLimitation.createdAt.getTime() + 24 * 60 * 60 * 1000),
        remainingTime: Math.max(0, 24 * 60 * 60 * 1000 - (Date.now() - recentLimitation.createdAt.getTime())),
      },
    });
  });

  // Report potential scam (money request)
  app.post('/report-scam', async (request, reply) => {
    const user = (request as any).user;
    const { targetUserId, messageId, chatId, description } = request.body as {
      targetUserId: string;
      messageId?: string;
      chatId?: string;
      description?: string;
    };

    const report = await app.prisma.report.create({
      data: {
        reporterId: user.userId,
        reportedId: targetUserId,
        reason: 'scam_attempt',
        description: `Potential scam: ${description || 'User requested money'}`,
        messageId,
        chatId,
      },
    });

    // Auto-warn the scammer
    const targetUser = await app.prisma.user.update({
      where: { id: targetUserId },
      data: { warningCount: { increment: 1 } },
    });

    await app.prisma.moderation.create({
      data: {
        moderatorId: 'SYSTEM',
        targetUserId,
        action: targetUser.warningCount >= 3 ? 'permanent_ban' : 'warning',
        reason: 'Scam attempt - requesting money',
        reportId: report.id,
      },
    });

    await app.prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'SAFETY_WARNING',
        title: 'Warning: Suspicious Activity',
        body: 'A user reported that you requested money. This may be considered a scam attempt and violates our rules.',
        data: { warningNumber: targetUser.warningCount },
      },
    });

    // If banned, notify
    if (targetUser.warningCount >= 3) {
      await app.prisma.user.update({
        where: { id: targetUserId },
        data: { isBanned: true, banPermanent: true, banReason: 'SCAM_ATTEMPT' },
      });

      await app.prisma.notification.create({
        data: {
          userId: targetUserId,
          type: 'PERMANENT_BAN',
          title: 'Account Banned',
          body: 'Your account has been banned for attempting scams.',
        },
      });
    }

    return reply.send({
      success: true,
      message: 'Scam report submitted. The user has been warned.',
      data: { 
        reportId: report.id,
        userWarned: true,
        userBanned: targetUser.warningCount >= 3,
      },
    });
  });

  // Alert about potential scam (sent to recipient when money is requested)
  app.post('/alert-scam/:chatId', async (request, reply) => {
    const user = (request as any).user;
    const { chatId } = request.params as { chatId: string };

    // Verify user is in this chat
    const participant = await app.prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId: user.userId,
      },
    });

    if (!participant) {
      return reply.status(403).send({
        success: false,
        error: 'You are not in this chat',
      });
    }

    // Get other participant
    const otherParticipant = await app.prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId: { not: user.userId },
      },
      include: { user: { select: { id: true, nickname: true, tag: true } } },
    });

    if (!otherParticipant) {
      return reply.status(404).send({
        success: false,
        error: 'Chat not found',
      });
    }

    const guidance = getLegalGuidance('DEFAULT');

    await app.prisma.notification.create({
      data: {
        userId: user.userId,
        type: 'SYSTEM',
        title: '⚠️ Potential Scam Alert',
        body: `${otherParticipant.user.nickname}#${otherParticipant.user.tag} is requesting money. This is a common scam tactic. DO NOT send any money. Would you like to report this profile and block this user?`,
        data: {
          type: 'scam_alert',
          targetUserId: otherParticipant.user.id,
          targetNickname: otherParticipant.user.nickname,
          targetTag: otherParticipant.user.tag,
          chatId,
          showReportButton: true,
          showBlockButton: true,
          guidance: guidance,
        },
      },
    });

    return reply.send({
      success: true,
      message: 'Scam alert sent to user',
    });
  });
}

function getLegalGuidance(country: string) {
  return {
    title: 'Safety Tips',
    body: 'If someone asks you for money online, it is likely a scam. Never send money to people you have not met in person.',
    advice: [
      'Do NOT send money',
      'Do NOT share bank details',
      'Do NOT buy gift cards',
      'Report and block this user',
      'This person may be a scammer',
    ],
  };
}
