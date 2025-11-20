// src/lib/candidate-store.ts
import { nanoid } from "nanoid";
import { readStorage, writeStorage } from "../lib/storage";
import type { Candidate } from "../types/data";

/** Keys */
const KEY = "candidates";

export function listCandidates(): Candidate[] {
  return readStorage(KEY, []);
}
export function getCandidate(id: string): Candidate | undefined {
  const all = listCandidates();
  const candidate = all.find(c => c.id === id);
  return candidate;
}

export function createCandidate(data: Omit<Candidate, "id">): Candidate {
  const all = listCandidates();
  const record: Candidate = { ...data, id: nanoid() };
  all.push(record);
  writeStorage(KEY, all);
  return record;
}


export function updateCandidate(id: string, patch: Partial<Candidate>) {
  const all = listCandidates();
  const idx = all.findIndex(c => c.id === id);
  if (idx === -1) return undefined;

  all[idx] = { ...all[idx], ...patch };
  writeStorage(KEY, all);
  return all[idx];
}

export function deleteCandidate(id: string) {
  const all = listCandidates();
  const idx = all.findIndex(c=> c.id === id);
  if(idx === -1) return undefined;
  const items = all.filter(i => i.id !== id);
  writeStorage(KEY, items);
  return true;
}
