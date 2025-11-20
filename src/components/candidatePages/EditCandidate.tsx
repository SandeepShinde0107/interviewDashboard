import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getCandidate,
    updateCandidate,
} from "../../utils/candidateStore";

import { ArrowLeft, Save } from "lucide-react";
import { updateInterviewByCandidate } from "../../utils/interviewStore";

export default function CandidateForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        designation: "",
        status: "scheduled" as "scheduled" | "completed" | "cancelled",
    });

    const [error, setError] = useState("");

    // Load data if editing
    useEffect(() => {
        if (!isEdit) return;

        const existing = getCandidate(id!);
        if (!existing) {
            setError("Candidate not found.");
            return;
        }

        setForm({
            firstName: existing.firstName,
            lastName: existing.lastName,
            email: existing.email ?? "",
            department: existing.department ?? "",
            designation: existing.designation ?? "",
            status: existing.status ?? "scheduled",
        });
    }, [id, isEdit]);

    const update = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.firstName || !form.lastName || !form.email || !form.department || !form.designation) {
            setError("All fields are required.");
            return;
        }

        if (isEdit) {
            // UPDATE MODE
            updateCandidate(id!, {
                ...form,
            });

            updateInterviewByCandidate(id!, {
                completed: form.status === "completed"
            })
            navigate("/candidates");
            return;
        }
        navigate("/candidates");
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 mb-3 text-gray-400 hover:text-gray-200"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="text-2xl font-bold mb-4">
                        Edit Candidate
                    </h1>
                </div>
                {error && (
                    <div className="p-2 mb-3 rounded bg-red-500/20 border border-red-500 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400">First Name</label>
                        <input
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
                            value={form.firstName}
                            onChange={(e) => update("firstName", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400">Last Name</label>
                        <input
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
                            value={form.lastName}
                            onChange={(e) => update("lastName", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400">Department</label>
                        <select
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
                            value={form.department}
                            onChange={(e) => update("department", e.target.value)}
                        >
                            <option value="">Select Department</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Data">Data</option>
                            <option value="Product">Product</option>
                            <option value="Design">Design</option>
                            <option value="HR">HR</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400">Designation</label>
                        <select
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
                            value={form.designation}
                            onChange={(e) => update("designation", e.target.value)}
                        >
                            <option value="">Select Designation</option>
                            <option value="Frontend Developer">Frontend Develope</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="FullStack Developer">Fullstack Developer</option>
                            <option value="Data Scientist">Data Scientist</option>
                            <option value="Product Manager">Product Manager</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Status</label>
                        <select
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
                            value={form.status}
                            onChange={(e) => update("status", e.target.value)}
                        >
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 p-2 rounded flex justify-center items-center gap-2"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}
