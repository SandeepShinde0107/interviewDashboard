// src/pages/RolesPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext"; 
import { ArrowLeft } from "lucide-react";
import {
  listMembers,
  createMember,
  updateMember,
  deleteMember,
  type Member,
} from "../../utils/memberStore";
import { Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <span className="relative group inline-block">
      {children}
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 z-50 whitespace-nowrap rounded bg-gray-800 text-gray-200 text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {text}
      </span>
    </span>
  );
}

export default function RolesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Member["role"]>("ta_member");
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    try {
      const all = listMembers();
      setMembers(all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "members") reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (members.find((m) => m.email.toLowerCase() === email.toLowerCase())) {
      setError("A member with this email already exists.");
      return;
    }
    createMember({ name: name.trim(), email: email.trim(), role });
    setName("");
    setEmail("");
    setRole("ta_member");
    reload();
  };

  const handleRoleChange = (id: string, newRole: Member["role"]) => {
    if (!isAdmin) return;
    updateMember(id, { role: newRole });
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Delete this user?")) return;
    deleteMember(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleLogout = ()=>{
    localStorage.removeItem('authUser');
    navigate("/dashboard");
  }
  if (loading) return <div className="p-6 text-gray-300">Loading roles…</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
         <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, <span className="text-indigo-300">{user?.username}</span></h1>
          <p className="text-sm text-gray-400 mt-1">Overview of Role Management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">Role: <span className="text-gray-100 ml-1">{(user?.role ?? "user").charAt(0).toUpperCase() + (user?.role ?? "user").slice(1)}</span></div>
          <button onClick={handleLogout} className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm">Logout</button>
        </div>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 mb-1 text-gray-400 hover:text-gray-200"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold">Roles Management</h1>
        </div>
      </div>
      <div className="max-w-7xl">
        {/* Add form */}
        <form
          onSubmit={handleAdd}
          className="bg-gray-800 border border-gray-700 p-4 rounded-xl mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div>
            <label className="text-xs text-white-400">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-gray-900 border border-gray-700 text-gray-200"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-xs text-white-400">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-gray-900 border border-gray-700 text-gray-200"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-white-400">Role</label>
            <div className="flex gap-50 mt-1">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Member["role"])}
                className="p-2 rounded bg-gray-900 border border-gray-700 text-gray-200"
              >
                <option value="admin">admin</option>
                <option value="panelist">panelist</option>
                <option value="ta_member">ta_member</option>
              </select>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 rounded"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
          </div>
        </form>
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Email</th>
                <th className="p-3 text-left font-medium">Role</th>
                <th className="p-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-gray-700">
                  <td className="p-3">{m.name}</td>
                  <td className="p-3">{m.email}</td>
                  <td className="p-3">
                    {isAdmin ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value as Member["role"])}
                        className="p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                      >
                        <option value="admin">admin</option>
                        <option value="panelist">panelist</option>
                        <option value="ta_member">ta_member</option>
                      </select>
                    ) : (
                      <Tooltip text="Admins only">
                        <select
                          disabled
                          value={m.role}
                          className="p-2 bg-gray-900 border border-gray-700 rounded text-gray-500 cursor-not-allowed"
                        >
                          <option value="admin">admin</option>
                          <option value="panelist">panelist</option>
                          <option value="ta_member">ta_member</option>
                        </select>
                      </Tooltip>
                    )}
                  </td>
                  <td className="p-3">
                    {isAdmin ? (
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <Tooltip text="Admins only">
                        <button
                          disabled
                          className="p-2 bg-gray-700 text-gray-400 rounded cursor-not-allowed"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Tooltip>
                    )}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    No members — add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
