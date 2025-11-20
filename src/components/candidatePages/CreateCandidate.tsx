import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCandidate } from "../../utils/candidateStore";
import { nanoid } from "nanoid";
import { ArrowLeft, Save } from "lucide-react";

export default function CreateCandidate() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        designation: "",
    });

    const [error, setError] = useState("");

    const update = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Required validation
        if (!form.firstName || !form.lastName || !form.email || !form.department || !form.designation) {
            setError("All fields are required.");
            return;
        }

        // Create candidate structure
        const newCandidate = {
            id: nanoid(),
            ...form,
            status: "scheduled" as const, //with const it is treated as literal type
        };

        createCandidate(newCandidate);

        navigate("/candidates"); // redirect
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            {/* Header */}

            <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 mb-3 text-gray-400 hover:text-gray-200"
                    >
                        <ArrowLeft size={18} />
                        
                    </button>
                    <h1 className="text-2xl font-bold mb-4">Add New Candidate</h1>
                </div>
                {error && (
                    <div className="p-2 mb-3 rounded bg-red-500/20 border border-red-500 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* First Name */}
                    <div>
                        <label className="text-sm text-gray-400">First Name</label>
                        <input
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
                            value={form.firstName}
                            onChange={(e) => update("firstName", e.target.value)}
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="text-sm text-gray-400">Last Name</label>
                        <input
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
                            value={form.lastName}
                            onChange={(e) => update("lastName", e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                        />
                    </div>

                    {/* Department */}
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

                    {/* Role */}
                    <div>
                        <label className="text-sm text-gray-400">Designation</label>
                        <select
                            className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
                            value={form.designation}
                            onChange={(e) => update("designation", e.target.value)}
                        >
                            <option value="">Select Designation</option>
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="FullStack Developer">Fullstack Developer</option>
                            <option value="Data Scientist">Data Scientist</option>
                            <option value="Product Manager">Product Manager</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 p-2 rounded flex justify-center items-center gap-2"
                    >
                        <Save size={18} />
                        Save Candidate
                    </button>
                </form>
            </div>
        </div>
    );
}
