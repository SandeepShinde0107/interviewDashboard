// src/lib/seed.ts
import { writeStorage } from "./storage";
import { nanoid } from "nanoid";
import type { Candidate, Interview } from "../types/data";
import type { Member } from "../utils/memberStore";

export function ensureSeed() {
  // console.log("%c[SEED] Running ensureSeed()", "color: #4ade80");
  let members: Member[] = [];

  try {
    const raw = localStorage.getItem("members");
    members = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(members)) members = [];
  } catch {
    members = [];
  }

  if (members.length === 0) {
    console.log("[SEED] Seeding members...");

    members = [
      { id: "u1", name: "Bob Martin", email: "bob@example.com", role: "panelist" },
      { id: "u2", name: "Sarah Kim", email: "sarah@example.com", role: "ta_member" },
      { id: "u3", name: "Emily S", email: "emilys@example.com", role: "admin" },
    ];

    writeStorage("members", members);
  }

  try {
    members = JSON.parse(localStorage.getItem("members") || "[]");
  } catch {
    members = [];
  }

  const panelists = members.filter(m => m.role === "panelist");

  // console.log("[SEED] Syncing interviewers:", panelists);

  writeStorage("interviewers", panelists);


  if (!localStorage.getItem("candidates")) {
    console.log("[SEED] Seeding candidates...");
    const c1: Candidate = {
      id: nanoid(),
      firstName: "Alice",
      lastName: "Khan",
      email: "alice@example.com",
      department: "Engineering",
      designation: "FE",
      status: "scheduled",
    };

    writeStorage("candidates", [c1]);

    const interviews: Interview[] = [
      { id: nanoid(), candidateId: c1.id,interviewerId:"u1", date: new Date().toISOString(), completed: false }
    ];
    writeStorage("interviews", interviews);
    writeStorage("feedback", []);
  }

  if (!localStorage.getItem("interviews")) {
    console.log("[SEED] Fixing interviews...");
    writeStorage("interviews", []);
  }

  if (!localStorage.getItem("feedback")) {
    console.log("[SEED] Fixing feedback...");
    writeStorage("feedback", []);
  }
}
