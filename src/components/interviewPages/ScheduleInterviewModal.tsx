import { useState, useRef } from "react";
import { createInterview } from "../../utils/interviewStore";
import { updateCandidate } from "../../utils/candidateStore";
import { listInterviewers } from "../../utils/useHelpers";
import AddInterviewerModal from "./AddInterviewerModal";
import { useAuth } from "../../context/AuthContext";

interface Props {
  candidate: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleInterviewModal({ candidate, onClose, onSuccess }: Props) {
  const interviewer: Array<{ id: string; name: string; email: string; role: string }> = listInterviewers();
  const [interviewerId, setInterviewerId] = useState("");
  const [interviewers, setInterviewers] = useState(listInterviewers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [date, setDate] = useState("");
  const { user } = useAuth();
  const dateRef = useRef<HTMLInputElement | null>(null);

  const reloadInterviewers = () => setInterviewers(listInterviewers())
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold mb-4">Schedule Interview</h2>
          {user?.role === 'admin' && (
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition mb-3"
              onClick={() => setShowAddModal(true)}
            >
              Add Interviewer
            </button>
          )}
        </div>
        <label className="text-sm text-gray-300">Select Interviewer</label>
        <select
          value={interviewerId}
          onChange={(e) => setInterviewerId(e.target.value)}
          className="w-full bg-gray-900 text-gray-200 p-2 rounded border border-gray-700 mb-4"
        >
          <option value="">Choose interviewer</option>
          {interviewer.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.email})
            </option>
          ))}
        </select>
        <label className="text-sm text-gray-300 cursor-pointer"
          onClick={() => dateRef.current?.showPicker()}
        >Date & Time</label>
        <input
          ref={dateRef}
          type="datetime-local"
          value={date}
          onFocus={() => dateRef.current?.showPicker()}
          onClick={() => dateRef.current?.showPicker()}
          onKeyDown={(e) => e.preventDefault()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-gray-900 text-gray-200 p-2 rounded border border-gray-700 mb-4 cursor-pointer"
        />
        <div className="flex justify-between gap-3">
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
      {showAddModal && (
        <AddInterviewerModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            reloadInterviewers();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
