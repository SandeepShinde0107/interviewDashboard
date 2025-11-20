// src/utils/userHelpers.ts
import { readStorage } from "../lib/storage";

export type UserRole = { id: string | number; name: string; role: string };

export function listMembers() {
   return readStorage("members", []);
}


export function listInterviewers() {
  return readStorage("interviewers", []);
}

// export function getMemberById(id: string | undefined): UserRole | undefined {
//   if (!id) return undefined;
//   return listMembers().find(m => String(m.id) === String(id));
// }
