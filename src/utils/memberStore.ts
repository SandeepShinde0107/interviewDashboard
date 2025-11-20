// src/utils/memberStore.ts
import { nanoid } from "nanoid";
import { readStorage, writeStorage } from "../lib/storage";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "panelist" | "ta_member";
};

const KEY = "members";

function read(): Member[] {
  return readStorage<Member[]>(KEY, []);
}

function write(items: Member[]) {
  writeStorage(KEY, items);
}

export function listMembers(): Member[] {
  return read();
}

export function getMember(id: string): Member | undefined {
  return read().find((m) => m.id === id);
}

export function createMember(payload: Omit<Member, "id">) {
  const items = read();
  let id = nanoid();
  while (items.find((m) => m.id === id)) id = nanoid();
  const rec: Member = { ...payload, id };
  items.push(rec);
  write(items);
  return rec;
}

export function updateMember(id: string, patch: Partial<Omit<Member, "id">>) {
  const items = read();
  const idx = items.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  items[idx] = { ...items[idx], ...patch };
  write(items);
  return items[idx];
}

export function deleteMember(id: string) {
  const items = read();
  const idx = items.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  const removed = items.splice(idx, 1)[0];
  write(items);
  return removed;
}
