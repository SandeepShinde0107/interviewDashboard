// src/lib/feedback-store.ts
import { nanoid } from "nanoid";
import { readStorage, writeStorage } from "../lib/storage";
import type { Feedback } from "../types/data";

const KEY = "feedback";

function read(): Feedback[] {
  return readStorage<Feedback[]>(KEY, []);
}

function write(items: Feedback[]) {
  writeStorage(KEY, items);
}

/** Returns all feedback for candidate sorted newest first */
export function listFeedbackByCandidate(candidateId: string): Feedback[] {
  return read().filter(f => f.candidateId === candidateId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * createFeedback enforces that current session role === "panelist"
 * (also UI should hide button; enforce here for safety)
 */
export function createFeedback(payload: Omit<Feedback, "id" | "createdAt" | "authorRole">) {
  const sessionRaw = localStorage.getItem("user");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  if (!session || session.role !== "panelist") {
    throw new Error("Only panelists can submit feedback");
  }

  const items = read();
  let id = nanoid();
  while (items.find(i => i.id === id)) id = nanoid();

  const rec: Feedback = {
    id,
    createdAt: new Date().toISOString(),
    authorRole: session.role,
    ...payload,
  };
  items.push(rec);
  write(items);
  return rec;
}
