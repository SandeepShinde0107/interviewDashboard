// src/pages/Users.tsx
import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useUsers, useInterviews } from "../hooks/useDashboardData";
import { parseISO } from "date-fns";
import { Search, ChevronLeft, ChevronRight, FileText, MessageCircle } from "lucide-react";
import FeedbackModal from "../components/feedback/FeedbackModal";
import KPICard from "../components/ui/KPICard";

type UserRow = {
  id: number;
  name: string;
  email: string;
  department?: string;
  role?: string; // app role — optional
  summary: { completed: number; noShow: number; scheduled: number; total: number };
};

export default function Users() {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: interviews = [], isLoading: ivLoading } = useInterviews();
  const loading = usersLoading || ivLoading;
  const {user} = useAuth();

  // UI state
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // completed/no-show/scheduled/all
  const [sortKey, setSortKey] = useState<"name" | "interviews">("interviews");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Feedback modal
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackUserId, setFeedbackUserId] = useState<number | null>(null);

  // Build per-user summary by aggregating interviews
  const userMap = useMemo(() => {
    const map = new Map<number, UserRow>();

    // initialize from users
    users.forEach((u: any) => {
      const name = `${u.firstName} ${u.lastName}`;
      map.set(u.id, {
        id: u.id,
        name,
        email: u.email,
        department: u?.company?.name || "—",
        role: (u as any).appRole || "—", // optional app role field if you add it later
        summary: { completed: 0, noShow: 0, scheduled: 0, total: 0 },
      });
    });

    // aggregate interviews into user entries (count per candidate)
    interviews.forEach((iv: any) => {
      const row = map.get(iv.userId);
      if (!row) return;
      if (iv.status === "completed") row.summary.completed += 1;
      else if (iv.status === "no-show") row.summary.noShow += 1;
      else if (iv.status === "scheduled") row.summary.scheduled += 1;
      row.summary.total += 1;
    });

    return map;
  }, [users, interviews]);

  // Build the rows array for rendering, applying search & filters
  const rows: UserRow[] = useMemo(() => {
    const arr = Array.from(userMap.values());

    // Text search filter: name & email (case insensitive)
    const q = query.trim().toLowerCase();
    const searched = q
      ? arr.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
      : arr;

    // Department filter
    const deptFiltered = departmentFilter !== "all" ? searched.filter((r) => r.department === departmentFilter) : searched;

    // Role filter (app role)
    const roleFiltered = roleFilter !== "all" ? deptFiltered.filter((r) => r.role === roleFilter) : deptFiltered;

    // Status filter — show users who have at least one interview with that status
    const statusFiltered =
      statusFilter === "all"
        ? roleFiltered
        : roleFiltered.filter((r) => {
            if (statusFilter === "completed") return r.summary.completed > 0;
            if (statusFilter === "no-show") return r.summary.noShow > 0;
            if (statusFilter === "scheduled") return r.summary.scheduled > 0;
            return true;
          });

    // Sorting
    const sorted = statusFiltered.sort((a, b) => {
      if (sortKey === "name") {
        const cmp = a.name.localeCompare(b.name);
        return sortDir === "asc" ? cmp : -cmp;
      } else {
        const cmp = a.summary.total - b.summary.total;
        return sortDir === "asc" ? cmp : -cmp;
      }
    });

    return sorted;
  }, [userMap, query, departmentFilter, roleFilter, statusFilter, sortKey, sortDir]);

  // Department options (from users)
  const departments = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u: any) => {
      if (u?.company?.name) set.add(u.company.name);
    });
    return Array.from(set).sort();
  }, [users]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageData = rows.slice((page - 1) * pageSize, page * pageSize);

  // Submit feedback handler
  const openFeedback = (userId: number) => {
    setFeedbackUserId(userId);
    setFeedbackOpen(true);
  };

  if (loading) return <div className="p-6 text-gray-300">Loading users...</div>;

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-start gap-4">
        <h2 className="text-xl font-semibold text-white">Candidates</h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search name or email"
              className="bg-gray-900 text-gray-200 px-3 py-2 rounded-md w-64 border border-gray-700 focus:outline-none"
            />
            <div className="absolute right-2 top-2 text-gray-400"><Search size={16} /></div>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-400">Department</label>
          <select className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700" value={departmentFilter} onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400">Role</label>
          <select className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700" value={roleFilter} onChange={(e)=>{ setRoleFilter(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option value="admin">Admin</option>
            <option value="ta_member">TA Member</option>
            <option value="panelist">Panelist</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400">Interview Status</label>
          <select className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="no-show">No-show</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400">Sort By</label>
          <select className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700" value={sortKey} onChange={(e)=> setSortKey(e.target.value as any)}>
            <option value="interviews">Interviews (total)</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400">Direction</label>
          <select className="bg-gray-900 text-gray-200 px-3 py-2 rounded border border-gray-700" value={sortDir} onChange={(e)=> setSortDir(e.target.value as any)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      {/* summary KPIs row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Candidates" value={rows.length} />
        <KPICard title="Candidates with interviews" value={rows.filter(r=>r.summary.total>0).length} />
        <KPICard title="Candidates with no-shows" value={rows.filter(r=>r.summary.noShow>0).length} />
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400 bg-gray-850">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Department</th>
              <th className="p-3">Role</th>
              <th className="p-3">Completed</th>
              <th className="p-3">No-shows</th>
              <th className="p-3">Scheduled</th>
              <th className="p-3">Total</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r, idx) => (
              <tr key={r.id} className="border-t border-gray-700 even:bg-gray-900">
                <td className="p-3 text-gray-300">{(page - 1) * pageSize + idx + 1}</td>
                <td className="p-3 text-white">{r.name}</td>
                <td className="p-3 text-gray-300">{r.email}</td>
                <td className="p-3 text-gray-300">{r.department}</td>
                <td className="p-3 text-gray-300">{r.role ?? "—"}</td>
                <td className="p-3 text-green-300">{r.summary.completed}</td>
                <td className="p-3 text-red-400">{r.summary.noShow}</td>
                <td className="p-3 text-blue-300">{r.summary.scheduled}</td>
                <td className="p-3 text-gray-100 font-semibold">{r.summary.total}</td>
                <td className="p-3">
                  <div className="flex gap-2 items-center">
                    <Link to={`/dashboard/users/${r.id}`} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white flex items-center gap-2">
                      <FileText size={14} /> View
                    </Link>

                    {/* Submit Feedback visible only to panelists */}
                    {/** We'll use current user role from auth context inside Users — but to keep this file self-contained,
                     *  you might import useAuth and conditionally show. If you want, I can add it below. */}
                     {user?.role === "panelist" && (
                       <button
                      onClick={() => openFeedback(r.id)}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-sm text-white flex items-center gap-2"
                    >
                      <MessageCircle size={14} /> Feedback
                    </button>
                     )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-400">
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, rows.length)} of {rows.length}
        </div>

        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40">
            <ChevronLeft size={18} />
          </button>
          <div className="text-sm text-gray-200 px-3">{page} / {totalPages}</div>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Feedback modal */}
      {feedbackOpen && feedbackUserId && (
        <FeedbackModal userId={feedbackUserId} onClose={() => { setFeedbackOpen(false); setFeedbackUserId(null); }} />
      )}
    </div>
  );
}
