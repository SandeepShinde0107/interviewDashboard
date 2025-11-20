import { useEffect, useMemo, useState } from "react";
import { parseISO, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import KPICard from "../components/ui/KPICard";
import { useRef } from "react";
import {
  listCandidates,
} from "../utils/candidateStore";
import {
  listAllInterviews,
} from "../utils/interviewStore";
import { listFeedbackByCandidate } from "../utils/feedbackStore";
import { listInterviewers } from "../utils/useHelpers";
import { Calendar, Users, UserX, ClipboardCheck, Clock, TrendingUp } from "lucide-react";
import "../App.css";


type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  status: "scheduled" | "completed" | "cancelled";
  department?: string;
  designation?: string;
};

type InterviewItem = {
  id: string;
  candidateId: string;
  interviewerId?: string;
  date: string;
  completed: boolean;
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interviewerFilter, setInterviewerFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

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
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (["candidates", "interviews", "feedback", "user"].includes(e.key)) {
        reload();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const candidateMap = useMemo(() => {
    const m = new Map<string, Candidate>();
    for (const c of candidates) m.set(c.id, c);
    return m;
  }, [candidates]);

  const filteredInterviews = useMemo(() => {
    const from = parseISO(`${dateFrom}T00:00:00`);
    const to = parseISO(`${dateTo}T23:59:59`);

    return interviews.filter((iv) => {

      const ivDate = parseISO(iv.date);
      if (!isWithinInterval(ivDate, { start: from, end: to })) return false;

      if (interviewerFilter !== "all") {
        if (iv.interviewerId !== interviewerFilter) return false;
      }

      if (roleFilter !== "all") {
        const cand = candidateMap.get(iv.candidateId);
        if (!cand) return false;
        if (cand.designation !== roleFilter) return false;
      }
      return true;
    });
  }, [
    interviews,
    dateFrom,
    dateTo,
    interviewerFilter,
    roleFilter,
    candidateMap
  ]);


  const totalCandidates = useMemo(() => {
    const ids = new Set(filteredInterviews.map(iv => iv.candidateId));
    return ids.size;
  }, [filteredInterviews]);


  const interviewsThisWeek = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    const candidateIds = new Set<string>();
    for (const iv of filteredInterviews) {
      const d = parseISO(iv.date);
      if (isWithinInterval(d, { start, end })) {
        const cand = candidateMap.get(iv.candidateId);
        if (cand && cand.status === "scheduled") candidateIds.add(cand.id);
      }
    }
    return candidateIds.size;
  }, [filteredInterviews, candidateMap]);


  const averageFeedbackScore = useMemo(() => {
    let total = 0;
    let count = 0;

    const involvedCandidates = new Set(filteredInterviews.map(iv => iv.candidateId));

    for (const id of involvedCandidates) {
      const fb = listFeedbackByCandidate(id);
      for (const f of fb) {
        total += f.score;
        count++;
      }
    }

    return count === 0 ? "0.0" : (total / count).toFixed(2);
  }, [filteredInterviews]);


  const noShows = useMemo(() => {
    const ids = new Set(filteredInterviews.map(iv => iv.candidateId));
    return candidates.filter(c => ids.has(c.id) && c.status === "cancelled").length;
  }, [filteredInterviews, candidates]);

  const completedInterviews = useMemo(() => {
    return filteredInterviews.filter(iv => iv.completed).length;
  }, [filteredInterviews]);

  const pendingFeedback = useMemo(() => {
    const ids = new Set(filteredInterviews.map(iv => iv.candidateId));
    return candidates.filter(c => ids.has(c.id) && c.status === "scheduled").length;
  }, [filteredInterviews, candidates]);

  const handleLogout = () => {
    logout();
    navigate("/");
    // localStorage.clear();
  };

  // const members = listMembers();
  type Interviewer = { id: string; name?: string; email?: string;[key: string]: any };
  const interviewers = listInterviewers() as Interviewer[];
  const interviewerOptions = interviewers.map(i => i.id);

  const interviewerMap = useMemo(() => {
    const m = new Map<string, Interviewer>();
    for (const i of interviewers) {
      if (i && typeof i.id === "string") m.set(i.id, i);
    }
    return m;
  }, [interviewers]);

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, <span className="text-indigo-300">{user?.username}</span></h1>
          <p className="text-sm text-gray-400 mt-1">Overview of Interviews & Candidates</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">Role: <span className="text-gray-100 ml-1">{(user?.role ?? "user").charAt(0).toUpperCase() + (user?.role ?? "user").slice(1)}</span></div>
          <button onClick={handleLogout} className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm">Logout</button>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-white-400">Interviewer</label>
          <select value={interviewerFilter} onChange={(e) => setInterviewerFilter(e.target.value)} className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700">
            <option value="all">All</option>
            {interviewerOptions.map((id) => {
              const info = interviewerMap.get(id);
              // console.log(info)
              if (!info) return null;
              return (
                <option key={id} value={id}>
                  {info.name}
                </option>
              )
            })}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white-400">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700"
          >
            <option value="all">All</option>
            {Array.from(new Set(candidates.map(c => c.designation).filter(Boolean))).map(r => (
              <option key={r} value={r!}>{r}</option>
            ))}

          </select>
        </div>

        <div>
          <label
            className="block text-xs text-white-400 cursor-pointer"
            onClick={() => fromRef.current?.showPicker()}
          >
            From
          </label>

          <input
            ref={fromRef}
            type="date"
            value={dateFrom}
            onFocus={() => fromRef.current?.showPicker()}
            onClick={() => fromRef.current?.showPicker()}
            onKeyDown={(e) => e.preventDefault()}   // prevents typing
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700 cursor-pointer date-white-icon"
          />
        </div>
        <div>
          <label 
            className="block text-xs text-white-400 cursor-pointer" 
            onClick={()=> fromRef.current?.showPicker()}>To</label>
          <input ref={toRef} type="date" value={dateTo} onFocus={()=> toRef.current?.showPicker()} 
            onClick={()=>  toRef.current?.showPicker()}
          onChange={(e) => setDateTo(e.target.value)} 
          className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700 cursor-pointer date-white-icon" />
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

      {/* Quick actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {user?.role === "admin" && (
            <Link to="/candidates" className="p-4 border border-gray-700 rounded hover:bg-gray-800 transition">
              <div className="font-medium">View / Manage Candidates</div>
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
