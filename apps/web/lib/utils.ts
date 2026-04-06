import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getZodiacSign(day: number, month: number): string {
  const signs = [
    { name: 'aries', end: { day: 19, month: 3 } },
    { name: 'taurus', end: { day: 20, month: 4 } },
    { name: 'gemini', end: { day: 20, month: 5 } },
    { name: 'cancer', end: { day: 22, month: 6 } },
    { name: 'leo', end: { day: 22, month: 7 } },
    { name: 'virgo', end: { day: 22, month: 8 } },
    { name: 'libra', end: { day: 22, month: 9 } },
    { name: 'scorpio', end: { day: 21, month: 10 } },
    { name: 'sagittarius', end: { day: 21, month: 11 } },
    { name: 'capricorn', end: { day: 19, month: 0 } },
    { name: 'aquarius', end: { day: 18, month: 1 } },
    { name: 'pisces', end: { day: 20, month: 2 } },
  ];

  for (const sign of signs) {
    if (month < sign.end.month || (month === sign.end.month && day <= sign.end.day)) {
      return sign.name;
    }
  }
  return 'capricorn';
}

export function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
