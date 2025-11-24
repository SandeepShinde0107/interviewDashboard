import { useState } from "react";
import { updateInterview } from "../../utils/interviewStore";
import { listInterviewers } from "../../utils/useHelpers";

interface Props {
  interview: any;                
  onClose: () => void;
  onSuccess: () => void;         
}

export default function EditInterviewModal({ interview, onClose, onSuccess }: Props) {
  const interviewers: Array<{ id: string; name: string; email: string; role: string }> = listInterviewers();

  const [interviewerId, setInterviewerId] = useState(interview.interviewerId || "");
  const [date, setDate] = useState(() => {
    try {
      const iso = interview.date;
      return iso ? iso.slice(0, 16) : "";
    } catch {
      return "";
    }
  });

  const handleUpdate = () => {
    if (!interviewerId) {
      alert("Please select an interviewer.");
      return;
    }
    if (!date) {
      alert("Please select date & time.");
      return;
    }

    updateInterview(interview.id, {
      interviewerId,
      date,
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl w-[400px] border border-gray-700 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Edit Interview</h2>

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
        <label className="text-sm text-gray-300">Date & Time</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-gray-900 text-gray-200 p-2 rounded border border-gray-700 mb-4"
        />

        <div className="flex justify-between gap-3">
          <button className="px-4 py-2 bg-gray-700 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded"
            onClick={handleUpdate}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
