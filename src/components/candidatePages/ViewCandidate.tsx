import { useEffect, useMemo, useState} from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    getCandidate,
    updateCandidate,
} from "../../utils/candidateStore";
import {
    listInterviewsByCandidate,
    createInterview,
} from "../../utils/interviewStore";
import {
    listFeedbackByCandidate,
} from "../../utils/feedbackStore";
import { ArrowLeft } from "lucide-react";
import InterviewSchedule from "../interviewPages/ScheduledInterviews";
import { deleteInterview } from "../../utils/interviewStore";
import FeedbackSection from "../feedback/FeedbackSection";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function ViewCandidate(){
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const query = useQuery();
    const tab = (query.get("tab") || "profile") as "profile" | "schedule" | "feedback";
    const [candidate, setCandidate] = useState<any | null>(null);
    const [interviews, setInterviews] = useState<any[]>([]);
    const [feedbackList, setFeedbackList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const loadAll = () => {
        setLoading(true);
        try {
            if (!id) return;
            const c = getCandidate(id);
            setCandidate(c ?? null);

            const ivs = listInterviewsByCandidate(id);
            setInterviews(ivs);

            const f = listFeedbackByCandidate(id);
            setFeedbackList(f);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
        const onStorage = () => loadAll();
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [id]);

    useEffect(() => {
        if (tab !== "schedule") return;
        if (!candidate) return;
        if (interviews.length > 0) return;
        if (candidate.status === "scheduled") {
            const now = new Date();
            now.setHours(10, 0, 0, 0); //default time is set to 10 AM
            createInterview({
                candidateId: candidate.id,
                interviewerId: undefined,
                date: now.toISOString(),
                completed: false,
                notes: "Auto-created scheduled interview",
            });
            const ivs = listInterviewsByCandidate(candidate.id);
            setInterviews(ivs);
        }
    }, [tab, candidate]);

    const counts = useMemo(() => {
        const completed = interviews.filter((i) => i.completed).length;
        const scheduled = interviews.filter((i) => !i.completed).length;
        const feedbackCount = feedbackList.length;
        return { completed, scheduled, feedbackCount };
    }, [interviews, feedbackList]);

    if (loading) {
        return <div className="p-6 text-gray-300">Loading candidate…</div>;
    }

    if (!candidate) {
        return <div className="p-6 text-red-400">Candidate not found.</div>;
    }

    const goToTab = (t: "profile" | "schedule" | "feedback") => {
        navigate(`/candidates/${candidate.id}?tab=${t}`, { replace: false });
    };

    const handleDeleteInterview = (ivId: string) => {
        if (confirm("Delete this interview?")) {
            deleteInterview(ivId);

            const updatedInterviews = listInterviewsByCandidate(candidate.id);
            setInterviews(updatedInterviews);

            const anyCompleted = updatedInterviews.some((i) => i.completed);
            if (anyCompleted) {
                updateCandidate(candidate.id, { status: "completed" });
            } else if (updatedInterviews.length > 0) {
                updateCandidate(candidate.id, { status: "scheduled" });
            } else {
                updateCandidate(candidate.id, { status: "cancelled" });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/candidates`)}
                            className="text-gray-400 hover:text-gray-200 inline-flex items-center gap-2 mb-1"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h1 className="text-2xl font-semibold">
                            {candidate.firstName} {candidate.lastName}
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 ml-7">
                        {candidate.designation ?? "—"}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-700">
                <nav className="flex gap-4">
                    <button
                        onClick={() => goToTab("profile")}
                        className={`px-3 py-2 -mb-px ${tab === "profile" ? "border-b-2 border-indigo-400 text-white" : "text-gray-400"}`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => goToTab("schedule")}
                        className={`px-3 py-2 -mb-px ${tab === "schedule" ? "border-b-2 border-indigo-400 text-white" : "text-gray-400"}`}
                    >
                        Schedule ({interviews.length})
                    </button>
                    <button
                        onClick={() => goToTab("feedback")}
                        className={`px-3 py-2 -mb-px ${tab === "feedback" ? "border-b-2 border-indigo-400 text-white" : "text-gray-400"}`}
                    >
                        Feedback ({feedbackList.length})
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="bg-gray-800 border border-gray-700 rounded p-4">
                {tab === "profile" && (
                    <div>
                        <h2 className="text-lg font-medium mb-4">Profile</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400">First name</label>
                                <div className="mt-1 text-white">{candidate.firstName}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Last name</label>
                                <div className="mt-1 text-white">{candidate.lastName}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Email</label>
                                <div className="mt-1 text-gray-300">{candidate.email ?? "—"}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Department</label>
                                <div className="mt-1 text-gray-300">{candidate.department ?? "—"}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Role</label>
                                <div className="mt-1 text-gray-300">{candidate.designation ?? "—"}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Interview summary</label>
                                <div className="mt-1 text-gray-300">
                                    Completed: <span className="text-green-300">{counts.completed}</span> • Scheduled: <span className="text-blue-300">{counts.scheduled}</span> • Feedback: <span className="text-indigo-300">{counts.feedbackCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "schedule" && (
                    <InterviewSchedule
                        interviews={interviews}
                        candidateStatus={candidate.status}
                        onDeleteInterview={handleDeleteInterview}
                    />
                )}

                {tab === "feedback" && (
                    <div>
                        <h2 className="text-lg font-medium mb-4">Provide Feedback</h2>
                        {/* Panelists ONLY */}
                        {user?.role === "panelist" ? (
                            <>
                                {/* Feedback List */}
                                <div className="space-y-3 mb-6">
                                    {feedbackList.length === 0 && (
                                        <div className="text-gray-400 p-3">No feedback yet.</div>
                                    )}
                                </div>
                                {/* Feedback Form */}
                                {/* <FeedbackForm
                                    candidateId={candidate.id}
                                    onSubmitted={() =>
                                        setFeedbackList(listFeedbackByCandidate(candidate.id))
                                    }
                                /> */}
                                <FeedbackSection candidateId={candidate.id}/>
                            </>
                        ) : (
                            <div className="text-gray-400 text-sm">
                                Only panelists can view and submit feedback.
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
