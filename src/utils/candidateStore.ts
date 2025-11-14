// src/lib/candidate-store.ts
import { nanoid } from "nanoid";
import { readStorage, writeStorage } from "../lib/storage";
import type { Candidate } from "../types/data";

/** Keys */
const KEY = "candidates";

/** Helpers */
function read(): Candidate[] {
  return readStorage<Candidate[]>(KEY, []);
}

function write(items: Candidate[]) {
  writeStorage(KEY, items);
}

export function listCandidates(): Candidate[] {
  return read();
}

export function getCandidate(id: string): Candidate | undefined {
  return read().find(c => c.id === id);
}

export function createCandidate(payload: Omit<Candidate, "id">): Candidate {
  const items = read();
  // generate unique id with collision detection
  let id = nanoid();
  while (items.find(i => i.id === id)) id = nanoid();

  const newC: Candidate = { ...payload, id };
  items.unshift(newC); // add to front
  write(items);
  return newC;
}

export function updateCandidate(id: string, patch: Partial<Candidate>): Candidate | undefined {
  const items = read();
  const idx = items.findIndex(c => c.id === id);
  if (idx === -1) return undefined;
  const updated = { ...items[idx], ...patch };
  items[idx] = updated;
  write(items);
  return updated;
}

export function deleteCandidate(id: string) {
  const items = read().filter(i => i.id !== id);
  write(items);
  return true;
}
