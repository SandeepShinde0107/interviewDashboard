// src/lib/types.ts
export type CandidateStatus = "scheduled" | "completed" | "cancelled";

export type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  department?: string;
  role?: string; // business role (not auth role)
  status: CandidateStatus;
};

export type Interview = {
  id: string;
  candidateId: string;
  interviewerId?: string;
  date: string; // ISO
  completed: boolean;
  notes?: string;
};

export type Feedback = {
  id: string;
  candidateId: string;
  authorRole?: string; // who submitted
  score: number; // 1..5
  strengths?: string;
  improvements?: string;
  createdAt: string;
};

export type UserSession = {
  id: string;
  username: string;
  role: "admin" | "ta_member" | "panelist";
};
