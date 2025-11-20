import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScheduleInterviewModal from "../../components/interviewPages/ScheduleInterviewModal";

import {
  listCandidates,
  deleteCandidate,
} from "../../utils/candidateStore";


import { Search, UserPlus } from "lucide-react";

export default function CandidatesPage() {
  const { user, logout } = useAuth();

  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [designation, setDesignation] = useState("all");
  const [status, setStatus] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const navigate = useNavigate();
  // Fetch
  const load = () => {
    setLoading(true);
    setCandidates(listCandidates());
    setLoading(false);
  };

  useEffect(() => {
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  // All filter logic
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const s = search.toLowerCase();

      if (s) {
        const hay = `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }

      if (department !== "all" && c.department !== department) return false;
      if (designation !== "all" && c.designation !== designation) return false;
      if (status !== "all" && c.status !== status) return false;

      return true;
    });
  }, [candidates, search, department, designation, status]);

  // Sorting — interview status order
  const sorted = useMemo(() => {
    const order: Record<string, number> = { scheduled: 1, completed: 2, cancelled: 3 };
    return [...filtered].sort((a, b) => (order[a.status] ?? 0) - (order[b.status] ?? 0));
  }, [filtered]);

  // Paginated
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return <div className="p-6 text-gray-300">Loading candidates…</div>;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
    // localStorage.clear();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* header */}
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

      {/* left side back button + text */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 mb-1 text-gray-400 hover:text-gray-200"
          >
            <ArrowLeft size={18} />

          </button>
          <h1 className="text-2xl font-bold">Candidates Dashboard</h1>
        </div>
        <Link
          to="/candidates/create"
          className="flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500"
        >
          <UserPlus size={18} />
          Add Candidate
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 border border-gray-700 rounded mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Search */}
          <div>
            <label className="text-xs text-white-400">Search (name/email)</label>
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded px-2">
              <Search size={16} className="text-gray-500" />
              <input
                className="bg-transparent p-2 w-full text-sm focus:outline-none"
                placeholder="Type to search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="text-xs text-white-400">Department</label>
            <select
              className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="all">All</option>
              {Array.from(new Set(candidates.map((c) => c.department))).map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Designation */}
          <div>
            <label className="text-xs text-white-400">Designation</label>
            <select
              className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            >
              <option value="all">All</option>
              {Array.from(new Set(candidates.map((c) => c.designation))).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-white-400">Interview Status</label>
            <select
              className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-700 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Designation</th>
              <th className="p-3 text-left">Interview Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c) => (
              <tr key={c.id} className="border-t border-gray-800">
                <td className="p-3">{c.firstName} {c.lastName}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.department}</td>
                <td className="p-3">{c.designation}</td>

                <td className="p-3 capitalize">
                  {c.status === "scheduled" && (
                    <span className="text-blue-400">Scheduled</span>
                  )}
                  {c.status === "completed" && (
                    <span className="text-green-400">Completed</span>
                  )}
                  {c.status === "cancelled" && (
                    <span className="text-red-400">Cancelled</span>
                  )}
                </td>

                <td className="p-3 flex gap-3">

                  {/* View Details — visible to all */}
                  <Link
                    to={`/candidates/${c.id}`}
                    className="text-indigo-400 hover:underline"
                  >
                    View
                  </Link>

                  <Link
                    to={`/candidates/${c.id}/edit`}
                    className="text-yellow-400 hover:underline"
                  >
                    Edit
                  </Link>
                  {/* Submit Feedback — panelists only */}
                  {user?.role === "panelist" && (
                    <Link
                      to={`/candidates/${c.id}?tab=feedback`}
                      className="text-green-400 hover:underline"
                    >
                      Submit Feedback
                    </Link>
                  )}

                  {/* Delete — all roles allowed */}
                  <button
                    onClick={() => {
                      if (confirm("Delete this candidate?")) {
                        deleteCandidate(c.id);
                        load();
                      }
                    }}
                    className="text-red-400 hover:xnderline"
                  >
                    Delete
                  </button>
                  {/* Schedule Interview — ta_members and admins only */}
                  {user?.role !== "panelist" && (
                  <button
                    className="text-blue-400 hover:underline"
                    onClick={() => setOpenScheduleModal(true)}
                  >
                    Schedule Interview
                  </button>
                  )}
                  {openScheduleModal && (
                    <ScheduleInterviewModal
                      candidate={candidates.find((cand) => cand.id === c.id)}
                      onClose={() => setOpenScheduleModal(false)}
                      onSuccess={()=> setOpenScheduleModal(false)}
                    />
                  )}
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  No candidates match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-4 text-gray-300">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`px-3 py-1 rounded ${page === 1
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-700"
              }`}
          >
            Prev
          </button>

          <div className="px-4 py-1 bg-gray-800 rounded">
            Page {page} of {totalPages}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={`px-3 py-1 rounded ${page === totalPages
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-700"
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
