// src/lib/storage.ts
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if(parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch(err){
    console.warn("Error reading storage key:", key, err);
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`writeStorage(${key}) failed:`, err);
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`removeStorage(${key}) failed:`, err);
  }
}