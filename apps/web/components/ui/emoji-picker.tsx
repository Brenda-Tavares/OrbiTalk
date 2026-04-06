import * as React from 'react';
import { Search, Clock, Smile, Heart, Star, Fire, Hand, Moon, Sun, Flag } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';

const EMOJI_CATEGORIES = [
  { name: 'Recent', icon: Clock, emojis: [] },
  { name: 'Smileys', icon: Smile, emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'] },
  { name: 'Hearts', icon: Heart, emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'] },
  { name: 'Stars', icon: Star, emojis: ['⭐', '🌟', '✨', '💫', '⚡', '💥', '🔥', '💢', '💦', '💨', '🕐', '💩', '🤡', '👻', '👽', '🤖', '💀', '☠️', '👺', '👹', '👿', '😈', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '✍️', '👏', '🙌', '👐', '🤲', '🤝', '🙏'] },
  { name: 'Nature', icon: Fire, emojis: ['🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🥀', '💐', '🌾', '🌱', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌵', '🌴', '🌳', '🌲', '🎋', '🎍', '🦋', '🐛', '🐝', '🐞', '🦄', '🐼', '🐨', '🦁', '🐯', '🦊', '🐻', '🐼', '🐨', '🐰', '🐶', '🐱', '🐭', '🐹', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄'] },
  { name: 'Food', icon: Sun, emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕'] },
  { name: 'Activities', icon: Moon, emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🧗', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧜', '🚴', '🚵'] },
  { name: 'Flags', icon: Flag, emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🇧🇷', '🇺🇸', '🇬🇧', '🇨🇳', '🇭🇰', '🇰🇷', '🇯🇵', '🇷🇺', '🇩🇪', '🇫🇷', '🇮🇹', '🇪🇸', '🇵🇹', '🇲🇽', '🇨🇦', '🇦🇺', '🇮🇳', '🇷🇪', '🇦🇷', '🇮🇪', '🇳🇱', '🇧🇪', '🇨🇭', '🇦🇹', '🇸🇪', '🇳🇴', '🇩🇰', '🇫🇮', '🇵🇱', '🇨🇿', '🇭🇺', '🇬🇷', '🇹🇷', '🇿🇦', '🇮🇱', '🇸🇦', '🇦🇪', '🇹🇭', '🇻🇳', '🇵🇭', '🇮🇩', '🇲🇾', '🇸🇬', '🇹🇼', '🇭🇰', '🇲🇴'] },
];

const SEARCH_EMOJIS: Record<string, string[]> = {
  'happy': ['😀', '😃', '😄', '😁', '🥳', '😊', '😍', '🥰'],
  'sad': ['😢', '😭', '😔', '😞', '💔', '😿'],
  'love': ['❤️', '💕', '😍', '🥰', '💖', '💗', '💓'],
  'angry': ['😠', '😤', '😡', '🤬', '💢'],
  'laugh': ['😂', '🤣', '😆', '😅', '🥹'],
  'cool': ['😎', '🤙', '👍', '✌️', '🤟'],
  'ok': ['👌', '👍', '✅', '✔️', '💯'],
  'no': ['👎', '❌', '🚫', '⛔', '🙅'],
  'yes': ['👍', '✅', '✔️', '👌', '💯'],
  'fire': ['🔥', '💥', '⚡', '✨', '💫'],
  'cool': ['😎', '🤙', '🆒', '👍', '✨'],
  'party': ['🎉', '🎊', '🥳', '🎈', '🎂'],
  'sad': ['😢', '😭', '💔', '😔', '😞'],
  'cry': ['😭', '🥺', '😢', '💧', '🧊'],
  'skull': ['💀', '☠️', '🤯', '😵', '👻'],
  'thinking': ['🤔', '💭', '🧐', '🤨', '👀'],
  'sleep': ['😴', '💤', '🛏️', '😪', '🥱'],
  'food': ['🍕', '🍔', '🍟', '🌮', '🍣', '🍜'],
  'music': ['🎵', '🎶', '🎤', '🎧', '🎸', '🎹'],
  'game': ['🎮', '🕹️', '🎲', '🃏', '♟️'],
  'sport': ['⚽', '🏀', '🏈', '⚾', '🎾'],
  'sun': ['☀️', '🌞', '🌅', '🌄', '🌻'],
  'moon': ['🌙', '🌛', '🌜', '🌝', '⭐'],
  'star': ['⭐', '🌟', '✨', '💫', '🌠'],
  'heart': ['❤️', '💕', '💖', '💗', '💓'],
  'check': ['✅', '✔️', '☑️', '👌', '👍'],
  'x': ['❌', '🚫', '⛔', '❎', '👎'],
  'warning': ['⚠️', '⚡', '🚨', '🔔', '❗'],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState(0);
  const [recentEmojis, setRecentEmojis] = React.useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentEmojis');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const filteredEmojis = React.useMemo(() => {
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const matchedEmojis: string[] = [];
      
      Object.entries(SEARCH_EMOJIS).forEach(([key, emojis]) => {
        if (key.includes(searchLower)) {
          matchedEmojis.push(...emojis);
        }
      });
      
      EMOJI_CATEGORIES.forEach((cat) => {
        cat.emojis.forEach((emoji) => {
          if (emoji.includes(searchLower)) {
            matchedEmojis.push(emoji);
          }
        });
      });
      
      return [...new Set(matchedEmojis)].slice(0, 50);
    }
    return EMOJI_CATEGORIES[activeCategory].emojis;
  }, [search, activeCategory]);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    
    setRecentEmojis((prev) => {
      const updated = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 24);
      localStorage.setItem('recentEmojis', JSON.stringify(updated));
      return updated;
    });
  };

  const displayEmojis = search.trim() 
    ? filteredEmojis 
    : activeCategory === 0 
      ? recentEmojis.length > 0 ? recentEmojis : ['😀', '❤️', '👍', '😂', '🔥']
      : filteredEmojis;

  return (
    <div className="flex h-80 w-80 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] p-2">
        <Search className="h-4 w-4 text-[var(--color-text-secondary)]" />
        <Input
          placeholder="Search emoji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 flex-1 text-sm"
        />
      </div>

      {!search.trim() && (
        <div className="flex gap-1 border-b border-[var(--color-border)] p-2">
          {EMOJI_CATEGORIES.map((category, index) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(index)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                activeCategory === index
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'hover:bg-[var(--color-elevated)] text-[var(--color-text-secondary)]'
              )}
              title={category.name}
            >
              <category.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-1">
          {displayEmojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => handleSelect(emoji)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-xl transition-transform hover:scale-125 hover:bg-[var(--color-elevated)]"
            >
              {emoji}
            </button>
          ))}
        </div>

        {displayEmojis.length === 0 && (
          <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
            No emojis found
          </div>
        )}
      </div>

      <div className="border-t border-[var(--color-border)] p-2 text-center text-xs text-[var(--color-text-secondary)]">
        {search.trim() ? 'Search results' : EMOJI_CATEGORIES[activeCategory].name}
      </div>
    </div>
  );
};
