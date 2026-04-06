"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/stores/theme";
import { useI18n } from "@/components/providers/i18n-provider";

type Step =
  | "contact"
  | "password"
  | "personal"
  | "verification"
  | "profile"
  | "terms";

const COUNTRIES = [
  { code: "BR", name: "Brasil", phoneCode: "+55" },
  { code: "US", name: "United States", phoneCode: "+1" },
  { code: "CN", name: "China", phoneCode: "+86" },
  { code: "HK", name: "Hong Kong", phoneCode: "+852" },
  { code: "KR", name: "South Korea", phoneCode: "+82" },
  { code: "JP", name: "Japan", phoneCode: "+81" },
  { code: "RU", name: "Russia", phoneCode: "+7" },
];

const GENDERS = [
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Feminino" },
  { value: "INTERSEX", label: "Intersexo" },
  { value: "PREFER_NOT", label: "Prefiro não responder" },
];

const GENDER_IDENTITIES = [
  { value: "WOMAN", label: "Mulher" },
  { value: "MAN", label: "Homem" },
  { value: "PREFER_NOT", label: "Prefiro não responder" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("contact");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    phoneCode: "+55",
    verificationMethod: "email" as "email" | "sms",
    password: "",
    confirmPassword: "",
    name: "",
    birthDate: "",
    country: "BR",
    state: "",
    city: "",
    gender: "",
    genderIdentity: "",
    nickname: "",
    tag: "",
    profilePhoto: null as File | null,
    selfieWithDoc: null as File | null,
    documentPhoto: null as File | null,
    acceptTerms: false,
  });

  const handleContactSubmit = () => {
    if (!formData.email || !formData.phone) {
      setError("Please fill in all fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError(null);
    setStep("password");
  };

  const handlePasswordSubmit = () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 symbol",
      );
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError(null);
    setStep("personal");
  };

  const handlePersonalSubmit = () => {
    if (!formData.name || !formData.birthDate || !formData.country) {
      setError("Please fill in all required fields");
      return;
    }

    const birth = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setError("You must be at least 18 years old to use OrbiTalk");
      return;
    }

    setError(null);
    setStep("verification");
  };

  const handleVerificationSubmit = () => {
    if (!formData.selfieWithDoc || !formData.documentPhoto) {
      setError("Please complete both verification steps");
      return;
    }
    setError(null);
    setStep("profile");
  };

  const handleProfileSubmit = () => {
    if (!formData.nickname || !formData.tag || !formData.profilePhoto) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.tag.length > 4) {
      setError("Tag must be at most 4 characters");
      return;
    }
    setError(null);
    setStep("terms");
  };

  const handleTermsSubmit = async () => {
    if (!formData.acceptTerms) {
      setError("You must accept the terms to continue");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        router.push("/register/confirm");
      } else {
        const data = await response.json();
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const steps: { key: Step; label: string }[] = [
    { key: "contact", label: "Contact" },
    { key: "password", label: "Password" },
    { key: "personal", label: "Personal" },
    { key: "verification", label: "Verify" },
    { key: "profile", label: "Profile" },
    { key: "terms", label: "Terms" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t("auth.registerTitle") || "Create Account"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t("auth.registerSubtitle") || "Join OrbiTalk"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg text-sm text-[var(--error)]">
            {error}
          </div>
        )}

        {step === "contact" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t("auth.email") || "Email"} *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t("auth.phone") || "Phone"} *
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.phoneCode}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneCode: e.target.value })
                  }
                  className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] font-medium"
                  style={{ color: '#1a1a1a' }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.phoneCode}>
                      {c.phoneCode} - {c.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="123456789"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {t("auth.verificationMethod") || "Verification Method"} *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="email"
                    checked={formData.verificationMethod === "email"}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        verificationMethod: "email",
                      })
                    }
                    className="accent-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    Email
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="sms"
                    checked={formData.verificationMethod === "sms"}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        verificationMethod: "sms",
                      })
                    }
                    className="accent-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    SMS
                  </span>
                </label>
              </div>
            </div>

            <Button onClick={handleContactSubmit} className="w-full">
              {t("common.continue") || "Continue"}
            </Button>
          </div>
        )}

        {step === "password" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t("auth.password") || "Password"} *
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t("auth.confirmPassword") || "Confirm Password"} *
              </label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Repeat password"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("contact")}>
                {t("common.back") || "Back"}
              </Button>
              <Button onClick={handlePasswordSubmit} className="flex-1">
                {t("common.continue") || "Continue"}
              </Button>
            </div>
          </div>
        )}

        {step === "personal" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t("auth.name") || "Full Name"} *
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("auth.name") || "Your full name"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t("auth.birthDate") || "Date of Birth"} *
              </label>
              <Input
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {t("auth.ageRequirement") || "You must be 18+ to use OrbiTalk"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t("auth.country") || "Country"} *
              </label>
              <select
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t("auth.state") || "State"}
              </label>
              <Input
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                placeholder={t("common.optional") || "Optional"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                City
              </label>
              <Input
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t("auth.gender") || "Gender"} (Optional)
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)]"
              >
                <option value="">Select...</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t("auth.genderIdentity") || "Gender Identity"} (Optional)
              </label>
              <select
                value={formData.genderIdentity}
                onChange={(e) =>
                  setFormData({ ...formData, genderIdentity: e.target.value })
                }
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)]"
              >
                <option value="">Select...</option>
                {GENDER_IDENTITIES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("password")}>
                {t("common.back") || "Back"}
              </Button>
              <Button onClick={handlePersonalSubmit} className="flex-1">
                {t("common.continue") || "Continue"}
              </Button>
            </div>
          </div>
        )}

        {step === "verification" && (
          <div className="space-y-4">
            <div className="bg-[var(--primary)]/10 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                {t("auth.verificationRequired") || "Identity Verification"}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {t("auth.verificationDesc") || "This helps keep OrbiTalk safe for everyone."}
              </p>
            </div>

            <div className="border border-[var(--border)] rounded-lg p-4">
              <h4 className="font-medium text-[var(--text-primary)] mb-2">
                {t("auth.verifyButton") || "Step 1: Selfie with Document"}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                {t("auth.verificationDesc") || "Take a selfie holding your ID document next to your face"}
              </p>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      selfieWithDoc: e.target.files?.[0] || null,
                    })
                  }
                  className="hidden"
                />
                <div className="w-full h-32 border-2 border-dashed border-[var(--border)] rounded-lg flex items-center justify-center cursor-pointer hover:border-[var(--primary)] transition-colors">
                  {formData.selfieWithDoc ? (
                    <span className="text-sm text-[var(--primary)]">
                      {formData.selfieWithDoc.name}
                    </span>
                  ) : (
                    <span className="text-sm text-[var(--text-secondary)]">
                      Tap to take photo
                    </span>
                  )}
                </div>
              </label>
            </div>

            <div className="border border-[var(--border)] rounded-lg p-4">
              <h4 className="font-medium text-[var(--text-primary)] mb-2">
                Step 2: Document Photo
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                Take a clear photo of your ID document. You can blur sensitive
                information.
              </p>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      documentPhoto: e.target.files?.[0] || null,
                    })
                  }
                  className="hidden"
                />
                <div className="w-full h-32 border-2 border-dashed border-[var(--border)] rounded-lg flex items-center justify-center cursor-pointer hover:border-[var(--primary)] transition-colors">
                  {formData.documentPhoto ? (
                    <span className="text-sm text-[var(--primary)]">
                      {formData.documentPhoto.name}
                    </span>
                  ) : (
                    <span className="text-sm text-[var(--text-secondary)]">
                      Tap to take photo
                    </span>
                  )}
                </div>
              </label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("personal")}>
                Back
              </Button>
              <Button onClick={handleVerificationSubmit} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "profile" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Nickname *
              </label>
              <Input
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                placeholder="2-20 characters"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Tag *
              </label>
              <Input
                value={formData.tag}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tag: e.target.value.toUpperCase().slice(0, 4),
                  })
                }
                placeholder="Up to 4 characters"
                maxLength={4}
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Example: {formData.nickname || "User"} #{formData.tag || "XXXX"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Profile Photo *
              </label>
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                Must show your face clearly (no cartoons, anime, or AI-generated
                images)
              </p>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profilePhoto: e.target.files?.[0] || null,
                    })
                  }
                  className="hidden"
                />
                <div className="w-full h-40 border-2 border-dashed border-[var(--border)] rounded-lg flex items-center justify-center cursor-pointer hover:border-[var(--primary)] transition-colors">
                  {formData.profilePhoto ? (
                    <span className="text-sm text-[var(--primary)]">
                      {formData.profilePhoto.name}
                    </span>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="w-10 h-10 mx-auto text-[var(--text-secondary)] mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Tap to upload photo
                      </span>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("verification")}>
                Back
              </Button>
              <Button onClick={handleProfileSubmit} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "terms" && (
          <div className="space-y-4">
            <div className="bg-[var(--surface)] rounded-lg p-4 max-h-60 overflow-y-auto">
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                Terms and Rules
              </h3>
              <div className="text-sm text-[var(--text-secondary)] space-y-3">
                <p>
                  <strong>Consent and Respect:</strong> All users must treat
                  each other with respect. No harassment, threats, or
                  discriminatory behavior.
                </p>
                <p>
                  <strong>Identity Verification:</strong> We verify identity to
                  protect minors and ensure a safe community. Documents are
                  encrypted and deleted after verification.
                </p>
                <p>
                  <strong>Scam Protection:</strong> Be cautious of requests for
                  money. Our AI will warn you if someone asks for money.
                </p>
                <p>
                  <strong>Banning:</strong> Immediate ban for minors, sexual
                  content involving minors, violence threats, or profile fraud.
                  Warning-based ban for harassment, prejudice, or spam (3
                  strikes).
                </p>
                <p>
                  <strong>Your Data:</strong> Under LGPD and similar laws, you
                  have the right to access, correct, and delete your data.
                </p>
                <p>
                  <strong>How to Report:</strong> Use the report button on any
                  message or profile to report violations.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptTerms: e.target.checked })
                }
                className="mt-1 accent-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text-primary)]">
                I have read and agree to the Terms and Rules. I understand that
                my identity has been verified and I am 18 years or older.
              </span>
            </label>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("profile")}>
                Back
              </Button>
              <Button
                onClick={handleTermsSubmit}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-[var(--text-secondary)] mt-6">
          {t("auth.alreadyHaveAccount") || "Already have an account?"}{" "}
          <Link href="/login" className="text-[var(--primary)] hover:underline">
            {t("common.login") || "Sign in"}
          </Link>
        </p>
      </Card>
    </div>
  );
}
