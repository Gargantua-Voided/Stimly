import { openDB, IDBPDatabase } from 'idb';
import { Drink, DrinkPreset, UserProfile } from '../types';

const DB_NAME = 'caffeine_iq_offline_db';
const DB_VERSION = 1;

export const DEFAULT_PRESETS: DrinkPreset[] = [
  {
    id: 'preset_redbull_250',
    name: 'Red Bull 250ml',
    brand: 'Red Bull',
    volumeMl: 250,
    caffeineMg: 80,
    color: '#06b6d4',
    category: 'energy-drink',
    iconType: 'can-slim',
  },
  {
    id: 'preset_monster_500',
    name: 'Monster 500ml',
    brand: 'Monster',
    volumeMl: 500,
    caffeineMg: 160,
    color: '#10b981',
    category: 'energy-drink',
    iconType: 'can-tall',
  },
  {
    id: 'preset_celsius_355',
    name: 'Celsius',
    brand: 'Celsius',
    volumeMl: 355,
    caffeineMg: 200,
    color: '#f97316',
    category: 'energy-drink',
    iconType: 'can-slim',
  },
  {
    id: 'preset_ghost_473',
    name: 'Ghost',
    brand: 'Ghost',
    volumeMl: 473,
    caffeineMg: 200,
    color: '#3b82f6',
    category: 'energy-drink',
    iconType: 'can-standard',
  },
];

export const DEFAULT_PROFILE: UserProfile = {
  weightKg: 75,
  heightCm: 178,
  age: 28,
  sex: 'male',
  baselineHeartRateBpm: 68,
  dailyLimitMg: 400, // EFSA / FDA standard
  halfLifeHours: 5.0, // Clinical population mean
  bedtime: '23:00',
  bedtimeThresholdMg: 25, // Deep sleep cutoff threshold
  metabolicSensitivity: 'normal',
  hasCompletedOnboarding: false,
  notificationsEnabled: true,
  alertHighDose: true,
  alertBedtime: true,
  alertDailyLimit: true,
  theme: 'light',
  steadyStateTargetMg: 100,
  sipAlertsEnabled: false,
  sipIntervalMinutes: 25,
};

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('drinks')) {
          const drinkStore = db.createObjectStore('drinks', { keyPath: 'id' });
          drinkStore.createIndex('timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('presets')) {
          db.createObjectStore('presets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// LocalStorage fallback helpers
const LS_DRINKS_KEY = 'caffeine_iq_drinks_ls';
const LS_PRESETS_KEY = 'caffeine_iq_presets_ls';
const LS_PROFILE_KEY = 'caffeine_iq_profile_ls';

// DRINKS CRUD
export async function getDrinks(): Promise<Drink[]> {
  try {
    const db = await getDb();
    const drinks = await db.getAll('drinks');
    // Sort descending by timestamp (newest first)
    drinks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return drinks;
  } catch (err) {
    console.warn('Falling back to localStorage for getDrinks', err);
    const raw = localStorage.getItem(LS_DRINKS_KEY);
    if (!raw) return [];
    try {
      const parsed: Drink[] = JSON.parse(raw);
      return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch {
      return [];
    }
  }
}

export async function saveDrink(drink: Drink): Promise<void> {
  try {
    const db = await getDb();
    await db.put('drinks', drink);
  } catch (err) {
    console.warn('Falling back to localStorage for saveDrink', err);
  }
  // Sync to localStorage
  const current = await getDrinks();
  const index = current.findIndex((d) => d.id === drink.id);
  if (index >= 0) {
    current[index] = drink;
  } else {
    current.unshift(drink);
  }
  localStorage.setItem(LS_DRINKS_KEY, JSON.stringify(current));
}

export async function deleteDrink(drinkId: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete('drinks', drinkId);
  } catch (err) {
    console.warn('Falling back to localStorage for deleteDrink', err);
  }
  const current = await getDrinks();
  const updated = current.filter((d) => d.id !== drinkId);
  localStorage.setItem(LS_DRINKS_KEY, JSON.stringify(updated));
}

export async function clearAllDrinks(): Promise<void> {
  try {
    const db = await getDb();
    await db.clear('drinks');
  } catch (err) {
    console.warn('Fallback clearing localStorage drinks', err);
  }
  localStorage.removeItem(LS_DRINKS_KEY);
}

export function sortPresets(presets: DrinkPreset[]): DrinkPreset[] {
  const getRank = (p: DrinkPreset): number => {
    const id = (p.id || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();

    // 1: Red Bull (first)
    if (id.includes('redbull') || name.includes('red bull') || brand.includes('red bull')) return 1;
    // 2: Monster (second)
    if (id.includes('monster') || name.includes('monster') || brand.includes('monster')) return 2;
    // 3: Celsius (third)
    if (id.includes('celsius') || name.includes('celsius') || brand.includes('celsius')) return 3;
    // 4: Ghost (fourth)
    if (id.includes('ghost') || name.includes('ghost') || brand.includes('ghost')) return 4;

    return 10;
  };

  return [...presets].sort((a, b) => getRank(a) - getRank(b));
}

// PRESETS CRUD
export async function getPresets(): Promise<DrinkPreset[]> {
  try {
    const db = await getDb();
    const presets = await db.getAll('presets');
    if (presets && presets.length > 0) {
      // If presets contain old non-requested drinks, reset to the clean 4
      const hasOldPresets = presets.some((p) =>
        ['preset_espresso_60', 'preset_drip_240', 'preset_coldbrew_350', 'preset_matcha_240', 'preset_reign_473'].includes(p.id)
      );
      if (!hasOldPresets) {
        return sortPresets(presets);
      }
    }
  } catch (err) {
    console.warn('Falling back to default presets', err);
  }

  // Seed default presets
  await saveAllPresets(DEFAULT_PRESETS);
  return sortPresets(DEFAULT_PRESETS);
}

export async function saveAllPresets(presets: DrinkPreset[]): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction('presets', 'readwrite');
    await tx.store.clear();
    for (const p of presets) {
      await tx.store.put(p);
    }
    await tx.done;
  } catch (err) {
    console.warn('Fallback saving presets to localStorage', err);
  }
  localStorage.setItem(LS_PRESETS_KEY, JSON.stringify(presets));
}

export async function savePreset(preset: DrinkPreset): Promise<void> {
  const current = await getPresets();
  const index = current.findIndex((p) => p.id === preset.id);
  if (index >= 0) {
    current[index] = preset;
  } else {
    current.push(preset);
  }
  await saveAllPresets(current);
}

export async function deletePreset(presetId: string): Promise<void> {
  const current = await getPresets();
  const filtered = current.filter((p) => p.id !== presetId);
  await saveAllPresets(filtered);
}

// USER PROFILE CRUD
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const db = await getDb();
    const item = await db.get('profile', 'user_profile');
    if (item && item.data) {
      return { ...DEFAULT_PROFILE, ...item.data };
    }
  } catch (err) {
    console.warn('Falling back to localStorage for getUserProfile', err);
  }

  const ls = localStorage.getItem(LS_PROFILE_KEY);
  if (ls) {
    try {
      const parsed = JSON.parse(ls);
      return { ...DEFAULT_PROFILE, ...parsed };
    } catch {
      // ignore
    }
  }

  return DEFAULT_PROFILE;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const db = await getDb();
    await db.put('profile', { key: 'user_profile', data: profile });
  } catch (err) {
    console.warn('Falling back to localStorage for saveUserProfile', err);
  }
  localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
}

export async function factoryResetAll(): Promise<void> {
  try {
    const db = await getDb();
    await db.clear('drinks');
    await db.clear('presets');
    await db.clear('profile');
    const tx = db.transaction('presets', 'readwrite');
    for (const p of DEFAULT_PRESETS) {
      await tx.store.put(p);
    }
    await tx.done;
    await db.put('profile', {
      key: 'user_profile',
      data: { ...DEFAULT_PROFILE, hasCompletedOnboarding: false },
    });
  } catch (err) {
    console.warn('Fallback clearing storage during factory reset', err);
  }
  localStorage.removeItem(LS_DRINKS_KEY);
  localStorage.removeItem(LS_PRESETS_KEY);
  localStorage.removeItem(LS_PROFILE_KEY);
}

