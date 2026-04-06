export const COUNTRIES = {
  'pt-BR': { name: 'Brasil', flag: '🇧🇷', code: 'BR' },
  en: { name: 'United States', flag: '🇺🇸', code: 'US' },
  zh: { name: '中国', flag: '🇨🇳', code: 'CN' },
  yue: { name: '中國', flag: '🇭🇰', code: 'HK' },
  ko: { name: '대한민국', flag: '🇰🇷', code: 'KR' },
  ja: { name: '日本', flag: '🇯🇵', code: 'JP' },
  ru: { name: 'Россия', flag: '🇷🇺', code: 'RU' },
} as const;

export const GAME_NAMES = {
  tic_tac_toe: { 'pt-BR': 'Jogo da Velha', en: 'Tic Tac Toe', zh: '井字游戏', yue: '圈圈叉叉', ko: '틱택토', ja: '三目並べ', ru: 'Крестики-нолики' },
  hangman: { 'pt-BR': 'Jogo da Forca', en: 'Hangman', zh: '猜单词', yue: '估字遊戲', ko: '행맨', ja: 'ハングマン', ru: 'Виселица' },
  chess: { 'pt-BR': 'Xadrez', en: 'Chess', zh: '国际象棋', yue: '國際象棋', ko: '체스', ja: 'チェス', ru: 'Шахматы' },
  checkers: { 'pt-BR': 'Damas', en: 'Checkers', zh: '跳棋', yue: '西洋象棋', ko: '체커', ja: 'チェッカーズ', ru: 'Шашки' },
  ludo: { 'pt-BR': 'Ludo', en: 'Ludo', zh: '飞行棋', yue: '飛行棋', ko: '루도', ja: 'ルード', ru: 'Лудо' },
  puzzle: { 'pt-BR': 'Quebra-cabeça', en: 'Puzzle', zh: '拼图', yue: '拼圖', ko: '퍼즐', ja: 'パズル', ru: 'Пазл' },
  word_search: { 'pt-BR': 'Caça-Palavras', en: 'Word Search', zh: '单词搜索', yue: '字詞搜尋', ko: '단어 찾기', ja: 'ワードサーチ', ru: 'Поиск слов' },
  uno: { 'pt-BR': 'Uno', en: 'Uno', zh: '乌诺', yue: 'UNO', ko: '우노', ja: 'ウノ', ru: 'Уно' },
  domino: { 'pt-BR': 'Dominó', en: 'Domino', zh: '多米诺骨牌', yue: '骨牌', ko: '多米诺', ja: 'ドミノ', ru: 'Домино' },
  connect_four: { 'pt-BR': '4 em Linha', en: 'Connect Four', zh: '四子棋', yue: '四子棋', ko: '네 자리', ja: '四目並べ', ru: 'Четыре в ряд' },
  crossword: { 'pt-BR': 'Palavras Cruzadas', en: 'Crossword', zh: '纵横填字', yue: '縱橫填字', ko: '크로스워드', ja: 'クロスワード', ru: 'Кроссворд' },
} as const;

export const SOCIAL_LINKS = [
  { key: 'wechat', label: 'WeChat', icon: '💬' },
  { key: 'telegram', label: 'Telegram', icon: '✈️' },
  { key: 'instagram', label: 'Instagram', icon: '📷' },
  { key: 'snapchat', label: 'Snapchat', icon: '👻' },
  { key: 'twitter', label: 'X / Twitter', icon: '🐦' },
  { key: 'kakaotalk', label: 'KakaoTalk', icon: '💛' },
  { key: 'discord', label: 'Discord', icon: '🎮' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵' },
  { key: 'youtube', label: 'YouTube', icon: '▶️' },
  { key: 'threads', label: 'Threads', icon: '🧵' },
] as const;

export const FORBIDDEN_WORDS = [
  ' menores',
  ' menores de ',
  'child',
  'kid',
  'bitch',
  'slut',
  'whore',
  'nigger',
  'nigga',
  'faggot',
  'retard',
  'cunt',
] as const;

export const CATEGORIES = {
  hangman: [
    { 'pt-BR': 'Animais', en: 'Animals', zh: '动物', yue: '動物', ko: '동물', ja: '動物', ru: 'Животные' },
    { 'pt-BR': 'Frutas', en: 'Fruits', zh: '水果', yue: '水果', ko: '과일', ja: '果物', ru: 'Фрукты' },
    { 'pt-BR': 'Países', en: 'Countries', zh: '国家', yue: '國家', ko: '국가', ja: '国', ru: 'Страны' },
    { 'pt-BR': 'Cores', en: 'Colors', zh: '颜色', yue: '顏色', ko: '색상', ja: '色', ru: 'Цвета' },
    { 'pt-BR': 'Esportes', en: 'Sports', zh: '运动', yue: '運動', ko: '스포츠', ja: 'スポーツ', ru: 'Спорт' },
    { 'pt-BR': 'Comidas', en: 'Food', zh: '食物', yue: '食物', ko: '음식', ja: '食べ物', ru: 'Еда' },
    { 'pt-BR': 'Veículos', en: 'Vehicles', zh: '车辆', yue: '車輛', ko: '차량', ja: '車', ru: 'Транспорт' },
    { 'pt-BR': 'Móveis', en: 'Furniture', zh: '家具', yue: '家具', ko: '가구', ja: '家具', ru: 'Мебель' },
  ],
} as const;
