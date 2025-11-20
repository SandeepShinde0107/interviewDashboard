import { parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import EditInterviewModal from "./EditInterviewModal";
import { listInterviewers } from "../../utils/useHelpers";

interface Props {
    interviews: any[];
    candidateStatus: "scheduled" | "completed" | "cancelled";
    onDeleteInterview: (id: string) => void;
    onRefresh?: () => void;
}

export default function InterviewSchedule({
    interviews,
    candidateStatus,
    onDeleteInterview,
    onRefresh,
}: Props) {

    const [editing, setEditing] = useState<any | null>(null);

    const interviewers = listInterviewers() as Array<{ id: string; name: string }>;
    const interviewMap = new Map(interviewers.map(i => [i.id, i]));

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Interview Schedule</h2>
            </div>

            {interviews.length === 0 && (
                <div className="p-5 text-center text-gray-400 bg-gray-900 border border-gray-700 rounded">
                    No interviews scheduled.
                </div>
            )}

            <div className="space-y-3">
                {interviews.map((iv) => {
                    const dateFormatted = parseISO(iv.date).toLocaleString();
                    const interviewer = interviewMap.get(iv.interviewerId);

                    return (
                        <div
                            key={iv.id}
                            className="p-4 bg-gray-900 border border-gray-700 rounded-lg flex justify-between items-center shadow-sm hover:border-gray-600 transition"
                        >
                            <div>
                                <div className="text-sm font-medium text-white">{dateFormatted}</div>
                                <div className="text-xs text-gray-400">
                                    Scheduled By {interviewer?.name || "Unknown"}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span
                                    className={`text-sm ${
                                        candidateStatus === "completed"
                                            ? "text-green-300"
                                            : candidateStatus === "cancelled"
                                            ? "text-red-300"
                                            : "text-blue-300"
                                    }`}
                                >
                                    {candidateStatus.charAt(0).toUpperCase() + candidateStatus.slice(1)}
                                </span>

                                {/* Delete */}
                                <button
                                    onClick={() => onDeleteInterview(iv.id)}
                                    className="p-2 rounded bg-red-600/20 hover:bg-red-600/30 transition"
                                >
                                    <Trash2 size={16} className="text-red-400" />
                                </button>

                                {/* Edit */}
                                <button
                                    onClick={() => setEditing(iv)}
                                    className="p-1 rounded bg-blue-600/20 hover:bg-blue-600/30 transition"
                                >
                                    ✏️
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ✔ Edit modal OUTSIDE the loop */}
            {editing && (
                <EditInterviewModal
                    interview={editing}
                    onClose={() => setEditing(null)}
                    onSuccess={() => {
                        setEditing(null);
                        onRefresh?.(); // not onAddInterview
                    }}
                />
            )}
        </div>
    );
}
