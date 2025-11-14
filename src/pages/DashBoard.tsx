import React, { useEffect, useMemo, useState } from "react";
import { parseISO, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust path if needed
import KPICard from "../components/ui/KPICard"; // your KPICard component
import { KPIChart } from "../components/ui/KPIChart"; // grouped bar chart component (see below if missing)
import type { JSX } from "react";
import {
  listCandidates,
} from "../utils/candidateStore";
import {
  listAllInterviews,
  listInterviewsByCandidate,
} from "../utils/interviewStore";
import { listFeedbackByCandidate } from "../utils/feedbackStore";

import { Calendar, Users, UserX, ClipboardCheck, Clock, TrendingUp } from "lucide-react";

type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  status: "scheduled" | "completed" | "cancelled";
  department?: string;
  role?: string;
};

type InterviewItem = {
  id: string;
  candidateId: string;
  interviewerId?: string;
  date: string; // ISO
  completed: boolean;
};

export default function DashboardPage(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // Filters
  const [interviewerFilter, setInterviewerFilter] = useState<string>("all"); // interviewerId or "all"
  const [roleFilter, setRoleFilter] = useState<string>("all"); // candidate.role or "all"
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Raw data read from stores
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);

  // load data
  const reload = () => {
    setLoading(true);
    try {
      const cs = listCandidates();
      const ivs = listAllInterviews();
      setCandidates(cs as Candidate[]);
      setInterviews(ivs as InterviewItem[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();

    // Listen to localStorage changes (other tabs or store helpers that write localStorage directly)
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (["candidates", "interviews", "feedback", "user"].includes(e.key)) {
        reload();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Build interviewer options (unique interviewerId values from interviews)
  const interviewerOptions = useMemo(() => {
    const ids = Array.from(new Set(interviews.map((i) => i.interviewerId).filter(Boolean)));
    return ids;
  }, [interviews]);

  // Helper: map candidate id -> candidate
  const candidateMap = useMemo(() => {
    const m = new Map<string, Candidate>();
    for (const c of candidates) m.set(c.id, c);
    return m;
  }, [candidates]);

  // Filtered interviews for the date range + interviewer filter + role filter (role applies to the candidate)
  const filteredInterviews = useMemo(() => {
    const from = parseISO(`${dateFrom}T00:00:00`);
    const to = parseISO(`${dateTo}T23:59:59`);

    return interviews.filter((iv) => {
      // date range
      const ivDate = parseISO(iv.date);
      if (!isWithinInterval(ivDate, { start: from, end: to })) return false;

      // interviewer filter
      if (interviewerFilter !== "all" && iv.interviewerId !== interviewerFilter) return false;

      // role filter via candidate
      if (roleFilter !== "all") {
        const c = candidateMap.get(iv.candidateId);
        if (!c) return false;
        if ((c.role ?? "—") !== roleFilter) return false;
      }

      return true;
    });
  }, [interviews, dateFrom, dateTo, interviewerFilter, roleFilter, candidateMap]);

  // KPIs
  const totalCandidates = candidates.length;

  // Interviews this week: count of candidates with status === "scheduled" and whose interviews fall into current week? 
  // Per your spec earlier: "Interviews This Week: Count of candidates with 'scheduled' status"
  const interviewsThisWeek = useMemo(() => {
    // If you want strict "this calendar week", use startOfWeek/endOfWeek
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start (adjust if needed)
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    // count unique candidate ids that have interview date within this week and candidate.status === 'scheduled'
    const candidateIds = new Set<string>();
    for (const iv of interviews) {
      const d = parseISO(iv.date);
      if (isWithinInterval(d, { start, end })) {
        const cand = candidateMap.get(iv.candidateId);
        if (cand && cand.status === "scheduled") candidateIds.add(cand.id);
      }
    }
    return candidateIds.size;
  }, [interviews, candidateMap]);

  // Average feedback score from all feedback entries
  const averageFeedbackScore = useMemo(() => {
    // read all feedback and compute average
    // We'll call listFeedbackByCandidate for each candidate and sum
    let total = 0;
    let count = 0;
    for (const c of candidates) {
      const f = listFeedbackByCandidate(c.id); // returns array
      for (const item of f) {
        total += item.score;
        count++;
      }
    }
    return count === 0 ? "0.0" : (total / count).toFixed(2);
  }, [candidates]);

  // No-shows: count candidates with status === "cancelled"
  const noShows = useMemo(() => candidates.filter((c) => c.status === "cancelled").length, [candidates]);

  // Completed interviews total (count of interview.completed === true)
  const completedInterviews = useMemo(() => interviews.filter((iv) => iv.completed).length, [interviews]);

  // Pending feedback: count of candidates with status === "scheduled" (assumed need feedback)
  const pendingFeedback = useMemo(() => candidates.filter((c) => c.status === "scheduled").length, [candidates]);

  // Build grouped chart data (grouped by date: completed, noShow, scheduled)
  const chartData = useMemo(() => {
    // We'll derive status per interview:
    // if interview.completed -> completed
    // else if candidate.status === "cancelled" -> no-show
    // else scheduled
    const map = new Map<string, { date: string; completed: number; noShow: number; scheduled: number }>();
    for (const iv of filteredInterviews) {
      const dateKey = iv.date.slice(0, 10); // YYYY-MM-DD
      const cand = candidateMap.get(iv.candidateId);
      const rec = map.get(dateKey) ?? { date: dateKey, completed: 0, noShow: 0, scheduled: 0 };
      if (iv.completed) rec.completed += 1;
      else if (cand && cand.status === "cancelled") rec.noShow += 1;
      else rec.scheduled += 1;
      map.set(dateKey, rec);
    }
    // Convert to array and sort oldest -> newest
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredInterviews, candidateMap]);

  // Handler for logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // loading state UI
  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, <span className="text-indigo-300">{user?.username}</span></h1>
          <p className="text-sm text-gray-400 mt-1">Overview of interviews & candidates</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">Role: <span className="text-gray-100 ml-1">{user?.role}</span></div>
          <button onClick={handleLogout} className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm">Logout</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-400">Interviewer</label>
          <select value={interviewerFilter} onChange={(e) => setInterviewerFilter(e.target.value)} className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700">
            <option value="all">All</option>
            {interviewerOptions.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400">Role</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700">
            <option value="all">All</option>
            {/* derive distinct roles from candidates */}
            {Array.from(new Set(candidates.map(c => c.role).filter(Boolean))).map(r => (
              <option key={r} value={r!}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700" />
        </div>

        <div>
          <label className="block text-xs text-gray-400">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700" />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard title="Interviews This Week" value={interviewsThisWeek} icon={<Calendar size={28} />} />
        <KPICard title="Average Feedback Score" value={averageFeedbackScore} icon={<TrendingUp size={28} />} />
        <KPICard title="No-Shows" value={noShows} icon={<UserX size={28} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard title="Total Candidates" value={totalCandidates} icon={<Users size={28} />} />
        <KPICard title="Completed Interviews" value={completedInterviews} icon={<ClipboardCheck size={28} />} />
        <KPICard title="Pending Feedback" value={pendingFeedback} icon={<Clock size={28} />} />
      </div>

      {/* Chart */}
      {/* <KPIChart data={chartData} /> */}

      {/* Quick actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {user?.role === "admin" && (
            <Link to="/candidates" className="p-4 border border-gray-700 rounded hover:bg-gray-800 transition">
              <div className="font-medium">Manage Candidates</div>
              <div className="text-sm text-gray-400">View and manage all candidates</div>
            </Link>
          )}

          {(user?.role === "admin" || user?.role === "ta_member") && (
            <Link to="/candidates" className="p-4 border border-gray-700 rounded hover:bg-gray-800 transition">
              <div className="font-medium">Schedule Interviews</div>
              <div className="text-sm text-gray-400">Set up new interview sessions</div>
            </Link>
          )}

          {user?.role === "panelist" && (
            <Link to="/candidates" className="p-4 border border-gray-700 rounded hover:bg-gray-800 transition">
              <div className="font-medium">Submit Feedback</div>
              <div className="text-sm text-gray-400">Provide feedback for interviews</div>
            </Link>
          )}

          <Link to="/candidates" className="p-4 border border-gray-700 rounded hover:bg-gray-800 transition">
            <div className="font-medium">View Candidates</div>
            <div className="text-sm text-gray-400">Browse candidate profiles</div>
          </Link>

          {user?.role === "admin" && (
            <Link to="/roles" className="p-4 border border-gray-700 rounded hover:bg-gray-800 transition">
              <div className="font-medium">Role Management</div>
              <div className="text-sm text-gray-400">Manage user roles and permissions</div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
