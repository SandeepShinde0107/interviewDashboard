import { useQuery } from "@tanstack/react-query";
import type{ User, Interview, Feedback } from "../types/data";
import axios from "axios";

// helper to create ISO dates in a range
function randomDate(start: Date, end: Date) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  d.setHours(10 + Math.floor(Math.random() * 6), 0, 0, 0);
  return d.toISOString();
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get("https://dummyjson.com/users?limit=100");
      return res.data.users as User[];
    },
  });
}

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await axios.get("https://dummyjson.com/posts?limit=200");
      return res.data.posts as any[];
    },
  });
}

/**
 * Simulate interviews by mapping users to interviewer and dates.
 * This is a client-side simulation (safe for frontend-only assignment).
 */
export function useInterviews() {
  return useQuery<Interview[]>({
    queryKey: ["interviews"],
    queryFn: async () => {
      const usersRes = await axios.get("https://dummyjson.com/users?limit=100");
      const users: User[] = usersRes.data.users;
      // pick interviewers from users with some rule (e.g., odd ids)
      const interviewers = users.filter(u => u.id % 5 === 0); // simple heuristic
      const candidates = users; // use same list as candidates

      // create ~80 simulated interviews over last 30 days
      const interviews: Interview[] = [];
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 30);

      for (let i = 0; i < 80; i++) {
        const candidate = candidates[Math.floor(Math.random() * candidates.length)];
        const interviewer = interviewers[Math.floor(Math.random() * interviewers.length)] || users[0];
        const date = randomDate(start, now);
        const statusRand = Math.random();
        const status: Interview["status"] = statusRand < 0.75 ? "completed" : statusRand < 0.9 ? "no-show" : "scheduled";
        interviews.push({
          id: i + 1,
          userId: candidate.id,
          interviewerId: interviewer.id,
          date,
          status,
        });
      }

      return interviews;
    },
  });
}

/**
 * Derive feedback by mapping posts to random scores.
 * In a real app you'd POST feedback; here we derive average scores from posts.
 */
export function useFeedback() {
  return useQuery<Feedback[]>({
    queryKey: ["feedback"],
    queryFn: async () => {
      const res = await axios.get("https://dummyjson.com/posts?limit=200");
      const posts = res.data.posts as any[];
      // map posts to feedback items (random scores)
      const feedback: Feedback[] = posts.map((p, idx) => ({
        id: p.id,
        userId: p.userId || (idx % 20) + 1,
        score: 1 + Math.floor(Math.random() * 5),
        strengths: p.title,
        improvements: p.body,
      }));
      return feedback;
    },
  });
}
