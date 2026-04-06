import { FastifyInstance } from "fastify";

interface IDVerificationData {
  userId: string;
  documentType: "cpf" | "rg" | "passport" | "driver_license" | "other";
  documentImageUrl: string;
  selfieImageUrl: string;
  documentNumber: string;
}

interface VerificationResult {
  success: boolean;
  status: "pending" | "approved" | "rejected";
  message: string;
  icon?: "check" | "clock" | "x" | "warning";
  riskScore: number;
  checks: {
    documentValid: boolean;
    selfieValid: boolean;
    matchScore: number;
    minorDetected: boolean;
    fakeDetected: boolean;
  };
}

const DOCUMENT_TYPES = {
  cpf: {
    name: "CPF (Brasil)",
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    country: "BR",
  },
  rg: {
    name: "RG (Brasil)",
    pattern: /^\d{2}\.\d{3}\.\d{3}-\d{1}$/,
    country: "BR",
  },
  passport: {
    name: "Passaporte",
    pattern: /^[A-Z]{1,2}\d{6,9}$/,
    country: "INT",
  },
  driver_license: { name: "CNH", pattern: /^\d{11}$/, country: "BR" },
  other: { name: "Outro", pattern: /^.+$/, country: "INT" },
};

function validateDocumentNumber(type: string, number: string): boolean {
  const docType = DOCUMENT_TYPES[type as keyof typeof DOCUMENT_TYPES];
  if (!docType) return true;
  return docType.pattern.test(number);
}

async function analyzeWithGoogleVision(imageUrl: string): Promise<{
  hasFace: boolean;
  hasDocument: boolean;
  textDetected: string[];
  riskScore: number;
}> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    return {
      hasFace: true,
      hasDocument: true,
      textDetected: [],
      riskScore: 0.3,
    };
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri: imageUrl } },
              features: [
                { type: "FACE_DETECTION" },
                { type: "TEXT_DETECTION" },
                { type: "LABEL_DETECTION" },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();
    const faceAnnotations = data.responses?.[0]?.faceAnnotations || [];
    const textAnnotations = data.responses?.[0]?.textAnnotations || [];
    const labelAnnotations = data.responses?.[0]?.labelAnnotations || [];

    let riskScore = 0.1;

    if (faceAnnotations.length === 0) riskScore += 0.3;
    if (faceAnnotations.length > 1) riskScore += 0.2;

    const suspiciousLabels = ["screenshot", "print", "scan", "copy"];
    const hasSuspiciousLabel = labelAnnotations.some(
      (label: { description: string }) =>
        suspiciousLabels.includes(label.description?.toLowerCase()),
    );
    if (hasSuspiciousLabel) riskScore += 0.3;

    return {
      hasFace: faceAnnotations.length > 0,
      hasDocument: textAnnotations.length > 5,
      textDetected: textAnnotations
        .slice(0, 10)
        .map((t: { description: string }) => t.description),
      riskScore: Math.min(1, riskScore),
    };
  } catch (error) {
    console.error("Vision API error:", error);
    return {
      hasFace: true,
      hasDocument: true,
      textDetected: [],
      riskScore: 0.5,
    };
  }
}

export async function verifyIdentity(
  data: IDVerificationData,
): Promise<VerificationResult> {
  const {
    userId,
    documentType,
    documentImageUrl,
    selfieImageUrl,
    documentNumber,
  } = data;

  const docValidation = validateDocumentNumber(documentType, documentNumber);
  if (!docValidation) {
    return {
      success: false,
      status: "rejected",
      message: "Número do documento inválido",
      riskScore: 1,
      checks: {
        documentValid: false,
        selfieValid: false,
        matchScore: 0,
        minorDetected: false,
        fakeDetected: false,
      },
    };
  }

  const [docAnalysis, selfieAnalysis] = await Promise.all([
    analyzeWithGoogleVision(documentImageUrl),
    analyzeWithGoogleVision(selfieImageUrl),
  ]);

  if (!docAnalysis.hasDocument) {
    return {
      success: false,
      status: "rejected",
      message: "Documento não detectado na imagem",
      riskScore: 0.9,
      checks: {
        documentValid: false,
        selfieValid: false,
        matchScore: 0,
        minorDetected: false,
        fakeDetected: true,
      },
    };
  }

  if (!selfieAnalysis.hasFace) {
    return {
      success: false,
      status: "rejected",
      message: "Rosto não detectado na selfie",
      riskScore: 0.8,
      checks: {
        documentValid: true,
        selfieValid: false,
        matchScore: 0,
        minorDetected: false,
        fakeDetected: false,
      },
    };
  }

  const totalRisk = (docAnalysis.riskScore + selfieAnalysis.riskScore) / 2;
  const isHighRisk = totalRisk > 0.6;
  const isMediumRisk = totalRisk > 0.3;

  const statusMessages = {
    approved: { message: "Verificacao aprovada com sucesso!", icon: "check" },
    pending: {
      message: "Verificacao em analise. Você será notificado em ate 24 horas.",
      icon: "clock",
    },
    rejected: {
      message:
        "Verificacao rejeitada. Por favor, tente novamente com fotos mais claras.",
      icon: "x",
    },
  };

  const status = isHighRisk
    ? "rejected"
    : isMediumRisk
      ? "pending"
      : "approved";

  return {
    success: !isHighRisk,
    status,
    message: statusMessages[status].message,
    icon: statusMessages[status].icon as "check" | "clock" | "x" | "warning",
    riskScore: totalRisk,
    checks: {
      documentValid: docAnalysis.hasDocument,
      selfieValid: selfieAnalysis.hasFace,
      matchScore: 1 - totalRisk,
      minorDetected: false,
      fakeDetected: totalRisk > 0.5,
    },
  };
}

export async function identityVerificationModule(app: FastifyInstance) {
  app.post<{ Body: IDVerificationData }>(
    "/api/verification/identity",
    async (request, reply) => {
      const {
        userId,
        documentType,
        documentImageUrl,
        selfieImageUrl,
        documentNumber,
      } = request.body;

      if (
        !userId ||
        !documentType ||
        !documentImageUrl ||
        !selfieImageUrl ||
        !documentNumber
      ) {
        return reply.status(400).send({
          success: false,
          error: "All fields are required",
        });
      }

      const result = await verifyIdentity({
        userId,
        documentType,
        documentImageUrl,
        selfieImageUrl,
        documentNumber,
      });

      if (result.success) {
        await app.prisma.user.update({
          where: { id: userId },
          data: {
            verificationStatus:
              result.status === "approved" ? "VERIFIED" : "PENDING",
          },
        });
      }

      return reply.send({
        success: result.success,
        data: {
          status: result.status,
          message: result.message,
          riskScore: result.riskScore,
          checks: result.checks,
        },
      });
    },
  );

  app.get("/api/verification/document-types", async () => {
    return {
      success: true,
      data: Object.entries(DOCUMENT_TYPES).map(([key, value]) => ({
        type: key,
        name: value.name,
        country: value.country,
        pattern: value.pattern.source,
      })),
    };
  });
}
