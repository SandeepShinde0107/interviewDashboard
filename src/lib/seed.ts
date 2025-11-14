// src/lib/seed.ts
import { readStorage, writeStorage } from "./storage.ts";
import { nanoid } from "nanoid";
import type { Candidate, Interview, Feedback, UserSession } from "../types/data.ts";

export function ensureSeed() {
  const has = localStorage.getItem("candidates");
  if (has) return; // already seeded

  const c1: Candidate = { id: nanoid(), firstName: "Alice", lastName: "Khan", email: "alice@example.com", department: "Engineering", role: "FE", status: "scheduled" };
  const c2: Candidate = { id: nanoid(), firstName: "Bob", lastName: "Mehta", email: "bob@example.com", department: "Data", role: "DS", status: "completed" };
  const c3: Candidate = { id: nanoid(), firstName: "Cara", lastName: "Patel", email: "cara@example.com", department: "Product", role: "PM", status: "cancelled" };

  const interviews: Interview[] = [
    { id: nanoid(), candidateId: c1.id, date: new Date().toISOString(), completed: false },
    { id: nanoid(), candidateId: c2.id, date: new Date(Date.now() - 86400000).toISOString(), completed: true },
  ];

  const feedback: Feedback[] = [
    { id: nanoid(), candidateId: c2.id, authorRole: "panelist", score: 4, strengths: "Good problem solving", improvements: "Communication", createdAt: new Date().toISOString() }
  ];

  writeStorage("candidates", [c1, c2, c3]);
  writeStorage("interviews", interviews);
  writeStorage("feedback", feedback);

  // Optionally seed a default user session (comment out in production)
  const user: UserSession = { id: nanoid(), username: "admin", role: "admin" };
  writeStorage("user", user);
}
