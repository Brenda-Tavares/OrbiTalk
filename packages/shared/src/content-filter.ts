const FORBIDDEN_PATTERNS = [
  // Sexual content
  /\b(sex|naked|nude|naked|nude|ninfet|pedo|pedophilia|xxx|porn|erotic|sexy|girlfriend|boyfriend|nsfw|adult|swingers|hentai|yaoi|yuri|fetish|bdsm|dick|pussy|cock|penis|vagina|boob|tits|ass|butt|slut|whore|bitch|fuck|shit|cunt|nigger|nigga|faggot|gay|lesbian|transsexual|shemale|tranny|prostitute)\b/gi,
  
  // Explicit adult terms
  /\b(blowjob|handjob|masturbat|orgy|gangbang|squirting|creampie|interracial|cuckold)\b/gi,
  
  // Inappropriate requests
  /\b(meet up|meet me|hook up|one night|escort|call ?girl|call ?boy|sugar ?daddy|sugar ?mommy)\b/gi,
  
  // Suspicious patterns
  /\b(free ?money|bitcoin ?scam|investment ?scam|pharmacy|viagra|pills)\b/gi,
  
  // Violence and harm
  /\b(kill|murder|rape|assault|abuse|torture|bomb|terror|attack|hate)\b/gi,
];

const SUSPICIOUS_PATTERNS = [
  /\b\d{6,}\b/, // Long numbers
  /[<>]/, // HTML tags
  /http[s]?:\/\//, // URLs
  /@[a-zA-Z0-9_]{20,}/, // Long @ mentions
];

export interface ContentFilterResult {
  isValid: boolean;
  violations: string[];
  sanitized: string;
}

export function filterContent(input: string): ContentFilterResult {
  const violations: string[] = [];
  let sanitized = input;

  for (const pattern of FORBIDDEN_PATTERNS) {
    const matches = input.match(pattern);
    if (matches) {
      violations.push(`Forbidden content detected: "${matches[0]}"`);
      sanitized = sanitized.replace(pattern, '***');
    }
  }

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(input)) {
      violations.push('Suspicious pattern detected');
      break;
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    sanitized,
  };
}

export function validateCustomTag(tag: string): { valid: boolean; reason?: string } {
  if (!tag || tag.trim().length === 0) {
    return { valid: false, reason: 'Tag cannot be empty' };
  }

  if (tag.length > 50) {
    return { valid: false, reason: 'Tag is too long (max 50 characters)' };
  }

  if (tag.length < 2) {
    return { valid: false, reason: 'Tag is too short (min 2 characters)' };
  }

  const result = filterContent(tag);
  if (!result.isValid) {
    return { valid: false, reason: 'Tag contains inappropriate content' };
  }

  // Check for only alphanumeric and spaces
  if (!/^[\w\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0400-\u04ff]+$/i.test(tag)) {
    return { valid: false, reason: 'Tag contains invalid characters' };
  }

  return { valid: true };
}

export function validateDescription(description: string): { valid: boolean; reason?: string } {
  if (description.length > 5000) {
    return { valid: false, reason: 'Description is too long' };
  }

  const result = filterContent(description);
  if (!result.isValid) {
    return { valid: false, reason: 'Description contains inappropriate content' };
  }

  return { valid: true };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 5000);
}
