const FALLBACKS: Record<string, string> = {
  '--color-primary': '#f59e0b',
  '--color-accent': '#10b981',
  '--color-accent-deep': '#059669',
  '--color-fun-pink': '#fb7185',
  '--color-fun-violet': '#a78bfa',
  '--color-fun-sky': '#60a5fa',
  '--color-fg': '#0f172a',
  '--color-border': '#faeee1',
};

export function cssVar(name: string): string {
  if (typeof window === 'undefined' || !document.documentElement) {
    return FALLBACKS[name] ?? '';
  }
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || (FALLBACKS[name] ?? '');
}
