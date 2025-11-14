import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

type UserRole = { id: number; name: string; role: string };

export default function Roles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("roles");
    if (stored) setRoles(JSON.parse(stored));
    else {
      const initial = [
        { id: 1, name: "Alice", role: "admin" },
        { id: 2, name: "Bob", role: "manager" },
        { id: 3, name: "Charlie", role: "viewer" },
      ];
      setRoles(initial);
      localStorage.setItem("roles", JSON.stringify(initial));
    }
  }, []);

  const handleChange = (id: number, newRole: string) => {
    const updated = roles.map((r) => (r.id === id ? { ...r, role: newRole } : r));
    setRoles(updated);
    localStorage.setItem("roles", JSON.stringify(updated));
  };

  if (user?.role !== "admin")
    return <p className="p-6 text-red-600 font-semibold">Access denied. Admins only.</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold mb-4">Role Management</h2>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">User</th>
            <th className="p-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.name}</td>
              <td className="p-2">
                <select
                  value={r.role}
                  onChange={(e) => handleChange(r.id, e.target.value)}
                  className="border p-1 rounded"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
