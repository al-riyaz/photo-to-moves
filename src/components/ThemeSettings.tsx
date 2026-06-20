import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Palette, Sun, Moon, RotateCcw } from 'lucide-react';

type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'app-theme-mode';
const TEXT_KEY = 'app-text-color';

const TEXT_PRESETS = [
  { label: 'Default', value: '' },
  { label: 'White', value: '#fafafa' },
  { label: 'Amber', value: '#fbbf24' },
  { label: 'Emerald', value: '#34d399' },
  { label: 'Sky', value: '#38bdf8' },
  { label: 'Rose', value: '#fb7185' },
  { label: 'Violet', value: '#a78bfa' },
];

/** Convert a #rrggbb hex string to a Tailwind/shadcn "H S% L%" token value. */
function hexToHslToken(hex: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyMode(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
}

function applyTextColor(hex: string) {
  const root = document.documentElement;
  if (!hex) {
    root.style.removeProperty('--foreground');
    return;
  }
  const token = hexToHslToken(hex);
  if (token) root.style.setProperty('--foreground', token);
}

const ThemeSettings: React.FC = () => {
  const [mode, setMode] = React.useState<ThemeMode>('dark');
  const [textColor, setTextColor] = React.useState<string>('');

  // Load saved preferences on mount.
  React.useEffect(() => {
    const savedMode = (localStorage.getItem(THEME_KEY) as ThemeMode | null) ??
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    const savedColor = localStorage.getItem(TEXT_KEY) ?? '';
    setMode(savedMode);
    setTextColor(savedColor);
    applyMode(savedMode);
    applyTextColor(savedColor);
  }, []);

  const updateMode = (next: ThemeMode) => {
    setMode(next);
    applyMode(next);
    localStorage.setItem(THEME_KEY, next);
  };

  const updateTextColor = (hex: string) => {
    setTextColor(hex);
    applyTextColor(hex);
    if (hex) localStorage.setItem(TEXT_KEY, hex);
    else localStorage.removeItem(TEXT_KEY);
  };

  const reset = () => {
    updateMode('dark');
    updateTextColor('');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Theme settings">
          <Palette className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-4">
        <div className="space-y-2">
          <Label>Appearance</Label>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => v && updateMode(v as ThemeMode)}
            className="grid grid-cols-2"
          >
            <ToggleGroupItem value="light" aria-label="Light mode" className="gap-2">
              <Sun className="h-4 w-4" /> Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="Dark mode" className="gap-2">
              <Moon className="h-4 w-4" /> Dark
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <Label>Text color</Label>
          <div className="flex flex-wrap gap-2">
            {TEXT_PRESETS.map((p) => {
              const active = textColor === p.value;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => updateTextColor(p.value)}
                  aria-label={`Text color ${p.label}`}
                  aria-pressed={active}
                  title={p.label}
                  className={`h-7 w-7 rounded-full border-2 transition-colors ${
                    active ? 'border-ring' : 'border-border'
                  }`}
                  style={{
                    background: p.value || 'hsl(var(--muted))',
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Label htmlFor="custom-text-color" className="text-xs text-muted-foreground">
              Custom
            </Label>
            <input
              id="custom-text-color"
              type="color"
              value={textColor || '#ffffff'}
              onChange={(e) => updateTextColor(e.target.value)}
              className="h-7 w-12 cursor-pointer rounded border border-border bg-transparent"
            />
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={reset} className="w-full">
          <RotateCcw className="h-4 w-4" />
          <span className="ml-2">Reset to default</span>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeSettings;