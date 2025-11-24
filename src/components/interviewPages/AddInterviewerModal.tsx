import { useState } from "react";
import { createInterviewer } from "../../utils/useHelpers";

export default function AddInterviewerModal({ onClose, onAdded }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !email.trim()) {
      alert("Enter name and email");
      return;
    }
    createInterviewer(name, email);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl w-[380px] border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Add Interviewer</h2>
        <label className="text-sm text-gray-300">Name</label>
        <input
          className="w-full bg-gray-900 text-gray-200 p-2 rounded border border-gray-700 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="text-sm text-gray-300">Email</label>
        <input
          className="w-full bg-gray-900 text-gray-200 p-2 rounded border border-gray-700 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-700 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded"
            onClick={handleAdd}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}


