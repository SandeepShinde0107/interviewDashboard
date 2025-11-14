// src/components/feedback/FeedbackModal.tsx
import React, { useState } from "react";
import { X } from "lucide-react";

type Props = {
  userId: number;
  onClose: () => void;
};

export default function FeedbackModal({ userId, onClose }: Props) {
  const [score, setScore] = useState<number | "">("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || Number(score) < 1 || Number(score) > 5) {
      alert("Please provide a score between 1 and 5");
      return;
    }
    setSubmitting(true);

    // For this frontend-only assignment we will persist to localStorage as feedback array
    const existing = JSON.parse(localStorage.getItem("feedback") || "[]");
    existing.push({
      id: Date.now(),
      userId,
      score: Number(score),
      strengths,
      improvements,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("feedback", JSON.stringify(existing));

    // small UX delay
    setTimeout(() => {
      setSubmitting(false);
      onClose();
      alert("Feedback saved (local)");
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 w-full max-w-md rounded-lg p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Submit Feedback</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-300">Overall Score (1-5)</label>
            <input type="number" min={1} max={5} value={score as any} onChange={(e)=> setScore(e.target.value === "" ? "" : Number(e.target.value))}
                   className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700" />
          </div>

          <div>
            <label className="text-sm text-gray-300">Strengths</label>
            <textarea value={strengths} onChange={(e)=> setStrengths(e.target.value)}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700" rows={3} />
          </div>

          <div>
            <label className="text-sm text-gray-300">Areas for improvement</label>
            <textarea value={improvements} onChange={(e)=> setImprovements(e.target.value)}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700" rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded bg-gray-700 text-gray-200">Cancel</button>
            <button type="submit" disabled={submitting} className="px-3 py-2 rounded bg-indigo-600 text-white">
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
