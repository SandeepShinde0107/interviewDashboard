// src/utils/feedbackStore.ts
import { nanoid } from "nanoid";
import { readStorage, writeStorage } from "../lib/storage";
import type { Feedback } from "../types/data";

const KEY = "feedback";

export function listFeedback(): Feedback[] {
  return readStorage(KEY, []);
}

export function listFeedbackByCandidate(candidateId: string): Feedback[] {
  return listFeedback().filter(f => f.candidateId === candidateId);
}

export function createFeedback(data: Omit<Feedback, "id" | "createdAt">): Feedback {
  const all = listFeedback();
  const record: Feedback = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...data,
  };

  all.push(record);
  writeStorage(KEY, all);
  return record;
}

export function updateFeedback(id: string, patch: Partial<Feedback>) {
  const all = listFeedback();
  const idx = all.findIndex(f => f.id === id);
  if (idx === -1) return undefined;

  all[idx] = { ...all[idx], ...patch };
  writeStorage(KEY, all);
  return all[idx];
}

export function deleteFeedback(id: string) {
  const all = listFeedback();
  const filtered = all.filter(f => f.id !== id);
  writeStorage(KEY, filtered);
  return true;
}
