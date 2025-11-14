// src/pages/UserDetail.tsx
import { useParams } from "react-router-dom";
import { useUsers } from "../hooks/useDashboardData";
import { useInterviews, useFeedback } from "../hooks/useDashboardData";
import { useMemo } from "react";
import { parseISO } from "date-fns";

export default function UserDetail() {
  const { id } = useParams();
  const userId = Number(id);
  const { data: users = [] } = useUsers();
  const { data: interviews = [] } = useInterviews();
  const { data: feedback = [] } = useFeedback();

  const user = users.find((u: any) => u.id === userId);
  const userInterviews = interviews.filter((iv:any) => iv.userId === userId);
  const userFeedback = feedback.filter((f:any) => f.userId === userId);

  if (!user) return <div className="p-6 text-gray-300">User not found</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-white">{user.firstName} {user.lastName}</h2>
      <p className="text-gray-400">{user.email}</p>

      <div className="mt-6">
        <h3 className="text-lg text-white mb-2">Interviews</h3>
        <ul className="space-y-2">
          {userInterviews.map((iv: any) => (
            <li key={iv.id} className="text-sm text-gray-300">
              {iv.date ? parseISO(iv.date).toLocaleString() : iv.date} — {iv.status}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-lg text-white mb-2">Feedback</h3>
        <ul className="space-y-2">
          {userFeedback.map((f: any) => (
            <li key={f.id} className="text-sm text-gray-300">Score: {f.score} — {f.strengths}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
