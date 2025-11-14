// src/lib/interview-store.ts
import { nanoid } from "nanoid";
import { readStorage, writeStorage } from "../lib/storage";
import type { Interview } from "../types/data";

const KEY = "interviews";

function read(): Interview[] {
  return readStorage<Interview[]>(KEY, []);
}

function write(items: Interview[]) {
  writeStorage(KEY, items);
}

export function listInterviewsByCandidate(candidateId: string): Interview[] {
  return read().filter(i => i.candidateId === candidateId).sort((a,b) => b.date.localeCompare(a.date));
}

export function listAllInterviews(): Interview[] {
  return read();
}

export function createInterview(payload: Omit<Interview, "id">) {
  const items = read();
  let id = nanoid();
  while (items.find(i => i.id === id)) id = nanoid();
  const record: Interview = { ...payload, id };
  items.push(record);
  write(items);
  return record;
}

export function updateInterview(id: string, patch: Partial<Interview>) {
  const items = read();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...patch };
  write(items);
  return items[idx];
}
