// src/pages/AccountDetailPage.jsx
import React, { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAccount } from "../features/accounts/useAccount";
import AccountHistoryChart from "../components/ui/charts/AccountHistoryChart";

const TIMEFRAMES = [
  { label: "W", days: 7 },
  { label: "M", days: 30 },
  { label: "6M", days: 182 },
  { label: "Y", days: 365 },
  { label: "All", days: Infinity },
];

export default function AccountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, loading, error, addContribution, deleteAccount } =
    useAccount(id);
  const [tf, setTf] = useState("All");

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState(false);

  // 1) Safe defaults
  const contributions = account?.contributions ?? [];
  const storedBalance = account?.balance ?? 0;

  // 2) fullTimeline always runs (hooks must be top level)
  const fullTimeline = useMemo(() => {
    // Build the points from contributions
    const points = contributions
      .map((c) => ({
        date: new Date(c.date),
        delta: c.type === "withdrawal" ? -c.amount : c.amount,
      }))
      .sort((a, b) => a.date - b.date)
      .reduce((arr, { date, delta }) => {
        const prev = arr.length ? arr[arr.length - 1].balance : 0;
        arr.push({ date, balance: prev + delta });
        return arr;
      }, []);

    // Always ensure at least one point at "today" with the stored balance
    const now = new Date();
    const seed = { date: now, balance: storedBalance };

    if (points.length === 0) {
      return [seed];
    }

    const last = points[points.length - 1];
    if (last.date.toDateString() !== now.toDateString()) {
      return [...points, seed];
    }

    return points;
  }, [contributions, storedBalance]);

  // 3) Filtered timeline
  const filtered = useMemo(() => {
    if (tf === "All") return fullTimeline;
    const days = TIMEFRAMES.find((t) => t.label === tf).days;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return fullTimeline.filter((pt) => pt.date.getTime() >= cutoff);
  }, [tf, fullTimeline]);

  const handleContribute = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addContribution(parseFloat(amount), "deposit", date);
      setAmount("");
      setShowModal(false);
    } catch {
      alert("Failed to add contribution");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteAccount(); // deletes this single account
    navigate("/dashboard"); // go back to list
  };

  // 4) Early returns
  if (loading) return <div>Loading account…</div>;
  if (error) return <div className="text-red-500">Error loading account</div>;
  if (!account) return <div className="text-gray-500">Account not found</div>;

  // 5) Prepare chart inputs
  const dates = filtered.map((pt) => pt.date.toLocaleDateString());
  const balances = filtered.map((pt) => pt.balance);
  const currentBalance = account.balance;
  const interestPct = (account.interest * 100).toFixed(2);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        {/* Back Button */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-base-500 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18"
              />
            </svg>
          </button>
          <h1>{account.title}</h1>
        </div>
        <div>
          <div className="dropdown dropdown-bottom dropdown-end">
            <div tabIndex={0} role="button" className="">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
            >
              <li>
                <Link to={`/edit-account/${account._id}`}>Edit Account</Link>
              </li>
              <li>
                <div
                  className="text-error"
                  onClick={() => setToDelete(true)}
                  title="Delete account"
                >
                  Delete Account
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Combined Card */}
      <div className="card bg-white shadow-lg p-6 space-y-6">
        <div className="flex justify-between items-top">
          <div>
            <h2 className="text-md">Current Balance</h2>
            <p className="text-3xl font-bold">
              $
              {currentBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          {interestPct > 0 && 
          (
              <div className="text-right">
                <p className="text-sm">{interestPct}% APY</p>
              </div>
            )}
        </div>

        {/* Chart */}
        <AccountHistoryChart key={tf} dates={dates} balances={balances} />

        {/* Timeframe Selector */}
        <div className="flex justify-center space-x-3 mt-4">
          {TIMEFRAMES.map(({ label }) => (
            <button
              key={label}
              className={`btn btn-sm ${
                tf === label ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => {
                console.log("Switching to", label);
                setTf(label);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <button className="btn btn-outline btn-lg w-full">Withdraw</button>
        <button
          className="btn btn-primary btn-lg w-full"
          onClick={() => setShowModal(true)}
        >
          Add Money
        </button>
      </div>

      {toDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Are you sure?</h3>
            <p className="py-4">This will permanently delete the account.</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ——— DaisyUI Modal ——— */}
      <input
        type="checkbox"
        id="contrib-modal"
        className="modal-toggle"
        checked={showModal}
        readOnly
      />
      {showModal && (
        <div
          className="modal modal-open"
          onClick={() => setShowModal(false)} // clicking backdrop closes
        >
          <div
            className="modal-box relative"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {/* X button */}
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h3 className="font-bold text-lg mb-4">Add Money</h3>
            <form onSubmit={handleContribute} className="space-y-4">
              {/* Amount */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Amount</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  disabled={submitting}
                />
              </div>

              {/* Date */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Actions */}
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${submitting ? "loading" : ""}`}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="card bg-white shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
        <div className="space-y-2">
          {account.contributions.map((c, i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <span className="font-medium capitalize">{c.type}</span>{" "}
                <span className="text-sm text-gray-500 ml-2">
                  {new Date(c.date).toLocaleDateString()}
                </span>
              </div>
              <div
                className={
                  c.type === "withdrawal" ? "text-red-500" : "text-green-500"
                }
              >
                {c.type === "withdrawal" ? "−" : "+"}$
                {c.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
