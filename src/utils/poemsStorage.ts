import { Poem } from '../types';
import { poems as defaultPoems } from '../data/poems';

const STORAGE_KEY = 'radiant_custom_poems';

export const loadStoredPoems = (): Poem[] => {
  if (typeof window === 'undefined') return defaultPoems;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure each poem has required properties
        return parsed.filter(p => p && typeof p.id === 'string' && typeof p.title === 'string');
      }
    }
  } catch (err) {
    console.warn("Error loading custom poems from localStorage:", err);
  }
  return defaultPoems;
};

export const persistPoems = (poemList: Poem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(poemList));
  } catch (err) {
    console.error("Error saving custom poems to localStorage:", err);
  }
};

export const getDefaultPoem = (id: string): Poem | undefined => {
  return defaultPoems.find(p => p.id === id);
};

export const isPoemDifferentFromDefault = (poem: Poem): boolean => {
  const def = getDefaultPoem(poem.id);
  if (!def) return true; // custom added poem
  if (poem.title !== def.title) return true;
  if (poem.subtitle !== def.subtitle) return true;
  if (poem.hook !== def.hook) return true;
  if (poem.lines.length !== def.lines.length) return true;
  return poem.lines.some((line, i) => line !== def.lines[i]);
};

export { defaultPoems };
