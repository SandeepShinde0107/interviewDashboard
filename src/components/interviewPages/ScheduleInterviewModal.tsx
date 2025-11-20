import  { useState } from "react";
import { createInterview } from "../../utils/interviewStore";
import { updateCandidate } from "../../utils/candidateStore";
import { listInterviewers } from "../../utils/useHelpers";

interface Props {
  candidate: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleInterviewModal({ candidate, onClose, onSuccess }: Props) {
  const interviewers: Array<{id: string; name: string; email: string; role: string}> = listInterviewers(); // [{id, name, email, role}]
  const [interviewerId, setInterviewerId] = useState("");
  const [date, setDate] = useState("");

  const handleSchedule = () => {
    if (!interviewerId) {
      alert("Please select an interviewer.");
      return;
    }
    if (!date) {
      alert("Please select interview date & time.");
      return;
    }
    createInterview({
      candidateId: candidate.id,
      interviewerId,
      date,
      completed: false,
      notes: "Scheduled via UI",
    });
    updateCandidate(candidate.id, { status: "scheduled" });
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl w-[400px] border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Schedule Interview</h2>
        <label className="text-sm text-gray-300">Select Interviewer</label>
        <select
          value={interviewerId}
          onChange={(e) => setInterviewerId(e.target.value)}
          className="w-full bg-gray-900 text-gray-200 p-2 rounded border border-gray-700 mb-4"
        >
          <option value="">Choose interviewer</option>
          {interviewers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.email})
            </option>
          ))}
        </select>

        {/* Date */}
        <label className="text-sm text-gray-300">Date & Time</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-gray-900 text-gray-200 p-2 rounded border border-gray-700 mb-4"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-700 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded"
            onClick={handleSchedule}
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
