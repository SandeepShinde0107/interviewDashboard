// src/components/FeedbackForm.tsx
import React, { useState, useEffect } from "react";
import { createFeedback, updateFeedback } from "../../utils/feedbackStore";

interface FeedbackFormProps {
  candidateId: string;
  editingFeedback?: any;
  onSubmitted: () => void;
}

export default function FeedbackForm({
  candidateId,
  editingFeedback,
  onSubmitted,
}: FeedbackFormProps) {
  const [score, setScore] = useState<number | "">("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // If editing → preload values
  useEffect(() => {
    if (editingFeedback) {
      setScore(editingFeedback.score);
      setStrengths(editingFeedback.strengths);
      setImprovements(editingFeedback.improvements);
    }
  }, [editingFeedback]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (score === "" || score < 1 || score > 5) {
      setError("Score must be between 1 and 5.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingFeedback) {
        // EDIT
        updateFeedback(editingFeedback.id, {
          score: Number(score),
          strengths,
          improvements,
        });
      }
      else {
        createFeedback({
          candidateId,
          score: Number(score),
          strengths,
          improvements,
        });
      }

      setScore("");
      setStrengths("");
      setImprovements("");

      onSubmitted();
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-lg font-semibold">
        {editingFeedback ? "Edit Feedback" : "Add Feedback"}
      </h2>
      {error && <div className="text-red-400 text-sm">{error}</div>}

      <div>
        <label className="text-xs text-gray-400">Overall Score (1-5)</label>
        <input
          type="number"
          min={1}
          max={5}
          className="w-32 p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
          value={score as any}
          onChange={(e) =>
            setScore(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </div>

      <div>
        <label className="text-xs text-gray-400">Strengths</label>
        <textarea
          rows={3}
          className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-gray-400">Areas for Improvement</label>
        <textarea
          rows={3}
          className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded"
          value={improvements}
          onChange={(e) => setImprovements(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          disabled={submitting}
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
        >
          {submitting ? "Saving..." : editingFeedback ? "Save Changes" : "Submit"}
        </button>

        <button
          type="button"
          className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
          onClick={() => {
            setScore("");
            setStrengths("");
            setImprovements("");
          }}
        >
          Reset
        </button>
      </div>
    </form>
  );
}
