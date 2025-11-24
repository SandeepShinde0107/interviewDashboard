export type CandidateStatus = "scheduled" | "completed" | "cancelled";

export type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  department?: string;
  designation: string;
  status: CandidateStatus;
};

export type Interview = {
  id: string;
  candidateId: string;
  interviewerId?: string;
  date: string;
  completed: boolean;
  notes?: string;
};

export type Feedback = {
  id: string;
  candidateId: string;
  authorRole?: string;
  score: number;
  strengths?: string;
  improvements?: string;
  createdAt: string;
};

export type UserSession = {
  id: string;
  username: string;
  role: "admin" | "ta_member" | "panelist";
};
