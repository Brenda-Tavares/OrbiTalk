import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn, debounce } from '@/lib/utils';

interface GifResult {
  id: string;
  title: string;
  previewUrl: string;
  fullUrl: string;
  width: number;
  height: number;
}

interface GifPickerProps {
  onSelect: (gif: GifResult) => void;
  onClose: () => void;
  source?: 'giphy' | 'tenor';
}

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || '';
const TENOR_API_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY || '';

export const GifPicker: React.FC<GifPickerProps> = ({ onSelect, onClose, source = 'giphy' }) => {
  const [query, setQuery] = React.useState('');
  const [gifs, setGifs] = React.useState<GifResult[]>([]);
  const [trending, setTrending] = React.useState<GifResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const searchGifs = React.useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
          setGifs([]);
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          let results: GifResult[] = [];

          if (source === 'giphy' && GIPHY_API_KEY) {
            const response = await fetch(
              `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=25&rating=g`
            );
            const data = await response.json();
            results = data.data.map((gif: any) => ({
              id: gif.id,
              title: gif.title,
              previewUrl: gif.images.fixed_height_small.url,
              fullUrl: gif.images.original.url,
              width: gif.images.original.width,
              height: gif.images.original.height,
            }));
          } else if (source === 'tenor' && TENOR_API_KEY) {
            const response = await fetch(
              `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(searchQuery)}&key=${TENOR_API_KEY}&limit=25&media_filter=gif`
            );
            const data = await response.json();
            results = data.results.map((gif: any) => ({
              id: gif.id,
              title: gif.title,
              previewUrl: gif.media_formats.tinygif?.url || gif.media_formats.nanogif?.url,
              fullUrl: gif.media_formats.gif?.url || gif.media_formats.mediumgif?.url,
              width: gif.media_formats.gif?.dims?.[0] || 200,
              height: gif.media_formats.gif?.dims?.[1] || 200,
            }));
          } else {
            // Fallback mock data if no API key
            results = generateMockGifs(searchQuery);
          }

          setGifs(results);
        } catch (err) {
          setError('Failed to search GIFs');
          setGifs([]);
        } finally {
          setIsLoading(false);
        }
      }, 500),
    [source]
  );

  const loadTrending = React.useMemo(
    () => async () => {
      setIsLoading(true);
      setError(null);

      try {
        let results: GifResult[] = [];

        if (source === 'giphy' && GIPHY_API_KEY) {
          const response = await fetch(
            `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=25&rating=g`
          );
          const data = await response.json();
          results = data.data.map((gif: any) => ({
            id: gif.id,
            title: gif.title,
            previewUrl: gif.images.fixed_height_small.url,
            fullUrl: gif.images.original.url,
            width: gif.images.original.width,
            height: gif.images.original.height,
          }));
        } else if (source === 'tenor' && TENOR_API_KEY) {
          const response = await fetch(
            `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=25&media_filter=gif`
          );
          const data = await response.json();
          results = data.results.map((gif: any) => ({
            id: gif.id,
            title: gif.title,
            previewUrl: gif.media_formats.tinygif?.url || gif.media_formats.nanogif?.url,
            fullUrl: gif.media_formats.gif?.url || gif.media_formats.mediumgif?.url,
            width: gif.media_formats.gif?.dims?.[0] || 200,
            height: gif.media_formats.gif?.dims?.[1] || 200,
          }));
        } else {
          results = generateMockGifs('trending');
        }

        setTrending(results);
        setGifs(results);
      } catch (err) {
        setError('Failed to load trending GIFs');
      } finally {
        setIsLoading(false);
      }
    },
    [source]
  );

  React.useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  React.useEffect(() => {
    searchGifs(query);
  }, [query, searchGifs]);

  return (
    <div className="flex h-96 w-80 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <Input
            placeholder="Search GIFs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center text-danger">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => onSelect(gif)}
                className="relative overflow-hidden rounded-lg transition-transform hover:scale-105"
              >
                <img
                  src={gif.previewUrl}
                  alt={gif.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {!isLoading && !error && gifs.length === 0 && (
          <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
            {query ? 'No GIFs found' : 'No trending GIFs'}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--color-border)] p-2 text-center text-xs text-[var(--color-text-secondary)]">
        Powered by {source === 'giphy' ? 'GIPHY' : 'Tenor'}
      </div>
    </div>
  );
};

function generateMockGifs(query: string): GifResult[] {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  
  return Array.from({ length: 12 }, (_, i) => ({
    id: `mock-${query}-${i}`,
    title: `${query} GIF ${i + 1}`,
    previewUrl: `https://via.placeholder.com/100x100/${colors[i % colors.length].replace('#', '')}/ffffff?text=GIF`,
    fullUrl: `https://via.placeholder.com/200x200/${colors[i % colors.length].replace('#', '')}/ffffff?text=GIF`,
    width: 200,
    height: 200,
  }));
}
