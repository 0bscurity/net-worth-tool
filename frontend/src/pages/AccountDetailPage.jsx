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
  const [tf, setTf] = useState("All");
  const navigate = useNavigate();
  const { id } = useParams();
  const [categoryName, setCategoryName] = useState("");
  const [categoryAmount, setCategoryAmount] = useState(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const {
    account,
    loading,
    error,
    addContribution,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useAccount(id);

  // Build timeline
  const contributions = account?.contributions ?? [];
  const storedBalance = account?.balance ?? 0;

  const fullTimeline = useMemo(() => {
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
    const now = new Date();
    const seed = { date: now, balance: storedBalance };
    if (!points.length) return [seed];
    const last = points[points.length - 1];
    return last.date.toDateString() === now.toDateString()
      ? points
      : [...points, seed];
  }, [contributions, storedBalance]);

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

  const openAddCategoryModal = () => {
    setEditMode(false);
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryAmount(0);
    setShowCategoryModal(true);
  };

  const handleConfirmDelete = async () => {
    await deleteAccount();
    navigate("/dashboard");
  };

  const handleEditCategory = (category) => {
    setCategoryName(category.name);
    setCategoryAmount(category.amount);
    setEditingCategoryId(category._id);
    setEditMode(true);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editMode) {
        await updateCategory(editingCategoryId, { name: categoryName, amount: categoryAmount });
      } else {
        await addCategory(categoryName, categoryAmount);
      }
      setShowCategoryModal(false);
      setCategoryName("");
      setCategoryAmount(0);
      setEditMode(false);
    } catch (err) { console.error(err) }
  };

  if (loading) return <div>Loading account…</div>;
  if (error) return <div className="text-red-500">Error loading account</div>;
  if (!account) return <div className="text-gray-500">Account not found</div>;

  const dates = filtered.map((pt) => pt.date.toLocaleDateString());
  const balances = filtered.map(pt=>pt.balance);
  const currentBalance = account.balance;
  const interestPct = (account.interest * 100).toFixed(2);
  const totalAllocated = account.categories.reduce(
    (sum, c) => sum + c.amount,
    0
  );
  const balanceAfterAllocations = currentBalance - totalAllocated;

  return (
    <div className="my-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-3">
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
          <p className="ms-4 font-semibold">
            {account.name || account.institution}
          </p>
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
          {interestPct > 0 && (
            <div className="text-right">
              <p className="text-sm">{interestPct}% APY</p>
            </div>
          )}
        </div>

        {/* Chart */}
        <AccountHistoryChart key={tf} dates={dates} balances={balances} />

        <div className="flex justify-center">
          <div className="inline-flex bg-gray-200 rounded-full p-1">
            {TIMEFRAMES.map(({ label }, idx) => {
              const isActive = tf === label;
              return (
                <button
                  key={label}
                  onClick={() => setTf(label)}
                  className={`btn btn-sm ${
                    isActive
                      ? "bg-white text-primary shadow"
                      : "bg-transparent text-gray-600"
                  }
                      ${idx === 0 ? "rounded-l-full" : ""}
                      ${idx === TIMEFRAMES.length - 1 ? "rounded-r-full" : ""}
                      ${
                        idx > 0 && idx < TIMEFRAMES.length - 1
                          ? "rounded-none"
                          : ""
                      }
                      `}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">
        {/* <button className="btn btn-outline btn-lg w-full rounded-lg">
          Withdraw
        </button> */}
        <button
          className="btn btn-primary btn-lg w-full rounded-lg"
          onClick={() => setShowModal(true)}
        >
          Add Money
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-white shadow-lg p-3 lg:p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">Allocations</h3>
              <p className="text-sm text-gray-500">
                Unallocated balance: $
                {balanceAfterAllocations.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <button
              onClick={openAddCategoryModal}
              className="btn btn-primary btn-circle btn-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>
          <ul className="space-y-2">
            {(account.categories || []).map((category) => (
              <li
                key={category._id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:shadow transition-shadow"
              >
                <div>
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-sm text-gray-500">
                    Amount: ${category.amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit"
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
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteCategory(category._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
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
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Transaction History */}
        <div className="card bg-white shadow p-3 lg:p-6">
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
                <div className="flex items-center space-x-2">
                  <span
                    className={
                      c.type === "withdrawal"
                        ? "text-red-500"
                        : "text-green-500"
                    }
                  >
                    {c.type === "withdrawal" ? "−" : "+"}$
                    {c.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  {/* <button
                  onClick={() => handleDeleteContribution(c._id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete Contribution"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      
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

      {showCategoryModal && (
        <div
          className="modal modal-open"
          onClick={() => setShowCategoryModal(false)} // <-- clicking backdrop
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()} // <-- prevent inside clicks from bubbling
          >
            <h3 className="font-bold text-lg">
              {editMode ? "Edit Category" : "Add Category"}
            </h3>
            <input
              type="text"
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="input input-bordered w-full mb-2"
            />
            <input
              type="number"
              placeholder="Amount"
              value={categoryAmount}
              onChange={(e) => setCategoryAmount(parseFloat(e.target.value))}
              className="input input-bordered w-full mb-2"
            />
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowCategoryModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveCategory}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
