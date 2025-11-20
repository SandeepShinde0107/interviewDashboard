import { useState, useEffect } from "react";
import Modal from "./Modal";
import FeedbackForm from "./FeedbackForm";
import {
  listFeedbackByCandidate,
  deleteFeedback,
} from "../../utils/feedbackStore";

export default function FeedbackSection({ candidateId }: { candidateId: string }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<any | null>(null);

  const load = () => {
    setFeedbacks(listFeedbackByCandidate(candidateId));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <button
        className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
        onClick={() => {
          setEditingFeedback(null);
          setShowModal(true);
        }}
      >
        Add Feedback
      </button>

      <div className="space-y-3">
        {feedbacks.map((fb) => (
          <div
            key={fb.id}
            className="border border-gray-700 bg-gray-800 p-4 rounded"
          >
            <p className="text-sm text-gray-300">
              <strong>Score:</strong> {fb.score}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Strengths:</strong> {fb.strengths}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Improvements:</strong> {fb.improvements}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 text-sm"
                onClick={() => {
                  setEditingFeedback(fb);
                  setShowModal(true);
                }}
              >
                Edit
              </button>

              {/* Delete Button */}
              <button
                className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 text-sm"
                onClick={() => {
                  deleteFeedback(fb.id);
                  load();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <FeedbackForm
          candidateId={candidateId}
          editingFeedback={editingFeedback}
          onSubmitted={() => {
            setShowModal(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}
