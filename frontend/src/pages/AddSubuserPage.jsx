// src/pages/AddSubuserPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubusers } from "../features/subusers/useSubusers";

export default function AddSubuserPage() {
  const navigate = useNavigate();
  const { createSubuser, loading, error } = useSubusers();

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSubuser({
        name,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to add sub-user:", err);
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Add a Sub-User
        </h2>
        <p className="text-sm text-center mb-6">Create a sub-user to designate accounts to different users</p>
        {error && (
          <div className="mb-4 text-red-600">
            {error.response?.data?.message || error.message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. Alice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {/* Submit */}
          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary w-full ${
                submitting ? "loading" : ""
              }`}
              disabled={submitting || loading}
            >
              {submitting || loading ? "Saving…" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
