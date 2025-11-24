// src/utils/userHelpers.ts
import { nanoid } from "nanoid";
import { readStorage } from "../lib/storage";

export type UserRole = { id: string | number; name: string; role: string };

export function listMembers() {
   return readStorage("members", []);
}


export function listInterviewers() {
  return readStorage("interviewers", []);
}

// adding interviewers
export function createInterviewer(name: string, email: string) {
  const members = JSON.parse(localStorage.getItem("members") || "[]");

  const newPerson = {
    id: nanoid(),
    name,
    email,
    role: "panelist",
  };

  members.push(newPerson);
  localStorage.setItem("members", JSON.stringify(members));

  // regenerate interviewers list
  const interviewers: UserRole[] = members.filter((m: UserRole) => m.role === "panelist");
  localStorage.setItem("interviewers", JSON.stringify(interviewers));

  return newPerson;
}