import { z } from 'zod';

export const USER_NAME_MIN_LENGTH = 1;
export const USER_NAME_MAX_LENGTH = 100;
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 20;
export const TAG_MIN_LENGTH = 1;
export const TAG_MAX_LENGTH = 4;
export const PASSWORD_MIN_LENGTH = 8;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MESSAGE_MAX_LENGTH = 2000;
export const DESCRIPTION_MAX_LENGTH = 5000;
export const TAG_LIST_MAX = 20;
export const AGE_MIN = 18;

export const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
] as const;

export const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
] as const;

export const LANGUAGE_LEVELS = ['basic', 'intermediate', 'advanced', 'native'] as const;

export const PET_TYPES = ['cat', 'dog', 'bird', 'fish', 'hamster', 'rabbit', 'turtle', 'snake', 'other', 'none'] as const;

export const HOBBY_TAGS = [
  'reading', 'writing', 'drawing', 'painting', 'photography', 'music',
  'singing', 'dancing', 'cooking', 'traveling', 'cinema', 'tv_shows',
  'gaming', 'sports', 'yoga', 'meditation', 'gardening', 'camping',
  'diving', 'skateboarding', 'cycling', 'running', 'anime', 'manga',
  'podcasts', 'crafts', 'DIY', 'volunteering', 'coding', 'astronomy',
  'fitness', 'fashion', 'beauty', 'technology', 'science', 'history',
  'philosophy', 'languages', 'cooking_baking', 'movies', 'theater',
  'comedy', 'podcasting', 'streaming', 'collecting', 'DIY_projects',
  'board_games', 'puzzles', 'fishing', 'hiking', 'climbing'
] as const;

export const MUSIC_GENRES = [
  'pop', 'rock', 'jazz', 'classical', 'hip_hop', 'rap', 'edm',
  'sertanejo', 'mpb', 'funk', 'reggaeton', 'k_pop', 'j_pop',
  'rnb', 'country', 'blues', 'metal', 'punk', 'lofi', 'bossa_nova',
  'reggae', 'samba', 'latino', 'folk', 'indie', 'techno', 'house',
  'alternative', 'soul', 'gospel', 'soundtrack', 'instrumental',
  'acoustic', 'vaporwave', 'trap', 'drum_bass', 'trance'
] as const;

export const MOVIE_GENRES = [
  'action', 'comedy', 'drama', 'horror', 'scifi', 'fantasy',
  'romance', 'thriller', 'animation', 'documentary', 'western',
  'musical', 'war', 'crime', 'mystery', 'adventure', 'superhero',
  'anime', 'korean_drama', 'indian_cinema', 'martial_arts',
  'biography', 'family', 'sports', 'history', 'film_noir'
] as const;

export const SERIES_GENRES = [
  'drama', 'comedy', 'action', 'thriller', 'horror', 'scifi',
  'fantasy', 'romance', 'mystery', 'crime', 'animation', 'anime',
  'korean_drama', 'documentary', 'reality_show', 'talk_show',
  'game_show', 'sports', 'medical', 'legal', 'historical',
  'teen', 'family', 'superhero', 'sitcom', 'mini_series'
] as const;

export const USER_NAME_REGEX = /^[a-zA-ZÀ-ÿ\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0400-\u04ff\s]+$/i;

export const UserNameSchema = z
  .string()
  .min(USER_NAME_MIN_LENGTH)
  .max(USER_NAME_MAX_LENGTH)
  .regex(USER_NAME_REGEX, { message: 'Name contains invalid characters' })
  .trim();

export const NicknameSchema = z
  .string()
  .min(NICKNAME_MIN_LENGTH)
  .max(NICKNAME_MAX_LENGTH)
  .regex(/^[a-zA-ZÀ-ÿ\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0400-\u04ff]+$/i, {
    message: 'Nickname can only contain letters',
  })
  .trim();

export const TagSchema = z
  .string()
  .min(TAG_MIN_LENGTH)
  .max(TAG_MAX_LENGTH)
  .regex(/^[a-zA-Z0-9]+$/i, {
    message: 'Tag can only contain letters and numbers',
  })
  .toUpperCase();

export const FullHandleSchema = z
  .string()
  .trim()
  .regex(/^(.+)#(.+)$/i, {
    message: 'Handle must be in format: nickname#tag',
  })
  .transform((val) => {
    const [nickname, tag] = val.split('#');
    return { 
      nickname: nickname.trim(), 
      tag: tag.trim().toUpperCase() 
    };
  });

export const PasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message: 'Password must contain at least one uppercase, one lowercase, one number, and one special character',
  });

export const EmailSchema = z
  .string()
  .email()
  .trim()
  .toLowerCase();

export const BirthDateSchema = z
  .string()
  .refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    return actualAge >= AGE_MIN;
  }, {
    message: `You must be at least ${AGE_MIN} years old`,
  });

export const DescriptionSchema = z
  .string()
  .max(DESCRIPTION_MAX_LENGTH)
  .trim()
  .optional();

export const MessageSchema = z
  .string()
  .min(1)
  .max(MESSAGE_MAX_LENGTH)
  .trim();

export const MessageTypeSchema = z.enum(['text', 'image', 'video', 'audio', 'gif', 'game_invite', 'call']);

export const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_IMAGES = 10;

export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'audio/webm'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const ALLOWED_GIF_URL_PATTERNS = [
  /^https:\/\/media\.giphy\.com\/media\//,
  /^https:\/\/tenor\.com\/view\//,
  /^https:\/\/tenor\.com\/ajax\//,
];

export const ImageSchema = z
  .object({
    type: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    size: z.number().max(MAX_FILE_SIZE),
  });

export const VisibilitySchema = z.enum(['first_name', 'full_name']);
export const ThemeSchema = z.enum(['dark', 'light', 'medium']);
export const LanguageSchema = z.enum(['pt-BR', 'en', 'zh', 'yue', 'ko', 'ja', 'ru']);
export const ZodiacSignSchema = z.enum(ZODIAC_SIGNS);
export const MbtiSchema = z.enum(MBTI_TYPES);
export const LanguageLevelSchema = z.enum(LANGUAGE_LEVELS);
export const PetTypeSchema = z.enum(PET_TYPES);

export const TagListSchema = z.array(z.string()).max(TAG_LIST_MAX).optional();
export const HobbyTagSchema = z.enum(HOBBY_TAGS);
export const MusicGenreSchema = z.enum(MUSIC_GENRES);
export const MovieGenreSchema = z.enum(MOVIE_GENRES);

export const VerificationStatusSchema = z.enum([
  'pending',
  'face_match',
  'document_verified',
  'approved',
  'rejected',
]);

export const FriendRequestStatusSchema = z.enum([
  'pending',
  'accepted',
  'declined',
  'blocked',
]);

export const GameTypeSchema = z.enum([
  'tic_tac_toe',
  'hangman',
  'chess',
  'checkers',
  'ludo',
  'puzzle',
  'word_search',
  'uno',
  'domino',
  'connect_four',
  'crossword',
]);

export const GameStatusSchema = z.enum([
  'waiting',
  'in_progress',
  'finished',
  'abandoned',
]);

export const CallTypeSchema = z.enum(['audio', 'video']);
export const CallStatusSchema = z.enum(['ringing', 'active', 'ended', 'missed', 'declined']);

export const NotificationTypeSchema = z.enum([
  'friend_request',
  'friend_accepted',
  'message',
  'call',
  'game_invite',
  'game_move',
  'system',
]);

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: UserNameSchema,
  nickname: NicknameSchema,
  tag: TagSchema,
  birthDate: BirthDateSchema,
});

export const SeriesGenreSchema = z.enum(SERIES_GENRES);

export const CustomTagSchema = z.object({
  value: z.string().min(1).max(50),
  isCustom: z.literal(true),
});

export const ProfileUpdateSchema = z.object({
  name: UserNameSchema.optional(),
  nickname: NicknameSchema.optional(),
  tag: TagSchema.optional(),
  visibility: VisibilitySchema.optional(),
  description: DescriptionSchema,
  avatar: z.string().url().optional(),
  zodiacSign: ZodiacSignSchema.optional(),
  showZodiac: z.boolean().optional(),
  mbti: MbtiSchema.optional(),
  pets: z.array(PetTypeSchema).optional(),
  animalsILike: z.array(z.string().max(100)).optional(),
  hobbies: z.array(z.string()).optional(),
  hobbiesCustom: z.array(z.string().max(50)).optional(),
  musicLikes: z.array(z.string()).optional(),
  musicLikesCustom: z.array(z.string().max(50)).optional(),
  musicDislikes: z.array(z.string()).optional(),
  movieLikes: z.array(z.string()).optional(),
  movieLikesCustom: z.array(z.string().max(50)).optional(),
  movieDislikes: z.array(z.string()).optional(),
  seriesLikes: z.array(z.string()).optional(),
  seriesLikesCustom: z.array(z.string().max(50)).optional(),
  seriesDislikes: z.array(z.string()).optional(),
});

export const UserLanguageSchema = z.object({
  language: LanguageSchema,
  level: LanguageLevelSchema,
});

export type UserName = z.infer<typeof UserNameSchema>;
export type Nickname = z.infer<typeof NicknameSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type FullHandle = z.infer<typeof FullHandleSchema>;
export type Password = z.infer<typeof PasswordSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type BirthDate = z.infer<typeof BirthDateSchema>;
export type Description = z.infer<typeof DescriptionSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Visibility = z.infer<typeof VisibilitySchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type ZodiacSign = z.infer<typeof ZodiacSignSchema>;
export type Mbti = z.infer<typeof MbtiSchema>;
export type LanguageLevel = z.infer<typeof LanguageLevelSchema>;
export type PetType = z.infer<typeof PetTypeSchema>;
export type HobbyTag = z.infer<typeof HobbyTagSchema>;
export type MusicGenre = z.infer<typeof MusicGenreSchema>;
export type MovieGenre = z.infer<typeof MovieGenreSchema>;
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;
export type FriendRequestStatus = z.infer<typeof FriendRequestStatusSchema>;
export type GameType = z.infer<typeof GameTypeSchema>;
export type GameStatus = z.infer<typeof GameStatusSchema>;
export type CallType = z.infer<typeof CallTypeSchema>;
export type CallStatus = z.infer<typeof CallStatusSchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type UserLanguage = z.infer<typeof UserLanguageSchema>;
