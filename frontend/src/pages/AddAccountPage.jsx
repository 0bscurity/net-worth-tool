// src/pages/AddAccountPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccounts } from "../features/accounts/useAccounts";
import { useSubusers } from "../features/subusers/useSubusers";

export default function AddAccountPage() {
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState("Checking");
  const [balance, setBalance] = useState("");
  const [interest, setInterest] = useState("");
  const [subuserId, setSubuserId] = useState(""); // ← new
  const [submitting, setSubmitting] = useState(false);

  const { addAccount } = useAccounts();
  const navigate = useNavigate();

  const { subusers, loading: subLoading, error: subError } = useSubusers();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addAccount({
        name,
        institution,
        type,
        balance: parseFloat(balance),
        interest: interest ? parseFloat(interest) / 100 : 0,
        ...(subuserId && { subuserId }),
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("handleSubmit error:", err);
      alert(
        `Failed to add account: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (subLoading) return <div>Loading people…</div>;
  if (subError) return <div className="text-red-500">Error loading people</div>;

  return (
    <div className="flex justify-center py-12 px-0">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">New Financial Account</h2>
        <form onSubmit={handleSubmit}>
          {/* Account Name */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Account Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. Apple Savings"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* — Subuser selector — */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Belongs to</span>
            </label>
            <select
              value={subuserId}
              onChange={(e) => setSubuserId(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Primary User</option>
              {subusers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Other fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Institution */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Institution</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="e.g. Bank of America"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
              />
            </div>

            {/* Account Type */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Account Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>Checking</option>
                <option>Savings</option>
                <option>Investment</option>
                <option>Credit</option>
              </select>
            </div>

            {/* Starting Balance */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Starting Balance</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered w-full"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </div>

            {/* Interest Rate (optional) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Interest Rate (%){" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered w-full"
                placeholder="e.g. 1.50"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className={`btn btn-primary px-10 ${submitting ? "loading" : ""}`}
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
