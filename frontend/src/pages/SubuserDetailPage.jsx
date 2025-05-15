// src/pages/SubuserDetailPage.jsx
import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSubuser } from "../features/subusers/useSubuser";
import { useAccounts } from "../features/accounts/useAccounts";
import NetWorthLineChart from "../components/ui/charts/NetWorthLineChart";
import { useSubusers } from "../features/subusers/useSubusers";

const TIMEFRAMES = [
  { label: "W", days: 7 },
  { label: "M", days: 30 },
  { label: "6M", days: 182 },
  { label: "Y", days: 365 },
  { label: "All", days: Infinity },
];

export default function SubuserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isPrimary = id === "primary";

  // const { subuser, loading: suLoad, error: suErr } = useSubuser(id);
  const { accounts, loading: acctLoading, error: acctErr } = useAccounts();
  const { deleteSubuser } = useSubusers();
  const [toDelete, setToDelete] = useState(false);

  const {
    subuser,
    loading: suLoad,
    error: suErr,
  } = useSubuser(isPrimary ? null : id);
  const [tf, setTf] = useState("All");

  // 1) Filter this sub-user’s accounts
  const subAccounts = useMemo(() => {
    if (isPrimary) {
      // primary = all accounts with no subuserId
      return accounts.filter((a) => !a.subuserId);
    }
    // otherwise match the ObjectId
    return accounts.filter((a) =>
      typeof a.subuserId === "string"
        ? a.subuserId === id
        : a.subuserId?.toString() === id
    );
  }, [accounts, id, isPrimary]);

  // 2) Compute totals
  const totalNetWorth = subAccounts.reduce((sum, a) => sum + a.balance, 0);
  const monthlyInterest = subAccounts.reduce(
    (sum, a) => sum + a.balance * ((a.interest || 0) / 12),
    0
  );

  // 3) Build historic timeline
  const allContribs = useMemo(() => {
    return subAccounts.flatMap((acct) =>
      acct.contributions.map((c) => ({
        date: new Date(c.date),
        delta: c.type === "withdrawal" ? -c.amount : c.amount,
      }))
    );
  }, [subAccounts]);

  const grouped = useMemo(() => {
    const m = {};
    allContribs.forEach(({ date, delta }) => {
      const key = date.toISOString().slice(0, 10);
      m[key] = (m[key] || 0) + delta;
    });
    return m;
  }, [allContribs]);

  const fullTimeline = useMemo(() => {
    let running = 0;
    return Object.keys(grouped)
      .sort()
      .map((day) => {
        running += grouped[day];
        return { date: day, netWorth: running };
      });
  }, [grouped]);

  const filteredTimeline = useMemo(() => {
    if (tf === "All") return fullTimeline;
    const days = TIMEFRAMES.find((t) => t.label === tf).days;
    const cutoff = Date.now() - days * 86400000;
    return fullTimeline.filter((pt) => new Date(pt.date).getTime() >= cutoff);
  }, [fullTimeline, tf]);

  const dates = useMemo(
    () => filteredTimeline.map((pt) => pt.date),
    [filteredTimeline]
  );
  const netWorths = useMemo(
    () => filteredTimeline.map((pt) => pt.netWorth),
    [filteredTimeline]
  );

  const handleConfirmDelete = async () => {
    await deleteSubuser(id);
    navigate("/dashboard");
  };

  // 4) Loading / error:
  if (
    acctLoading ||
    // for non-primary, wait if it’s loading OR subuser hasn’t arrived yet
    (!isPrimary && (suLoad || !subuser))
  ) {
    return <div>Loading…</div>;
  }
  if (acctErr) return <div className="text-red-500">{acctErr.message}</div>;
  if (!isPrimary && suErr)
    return <div className="text-red-500">{suErr.message}</div>;

  // 5) Render header with either subuser’s info or “You”
  const displayName = isPrimary ? "You" : subuser.name;

  return (
    <div className="my-4 max-w-4xl mx-auto space-y-6">
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
          <p className="ms-4 font-semibold">{displayName}</p>
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
                {/* <Link to={`/edit-subuser/${account._id}`}>Edit Account</Link> */}
              </li>
              {!isPrimary && (
                <li>
                  <div
                    className="text-error"
                    onClick={() => setToDelete(true)}
                    title="Delete sub-user"
                  >
                    Delete Sub-User
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {toDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Are you sure?</h3>
            <p className="py-4">This will permanently delete {displayName}.</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setToDelete(false)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-primary shadow">
          <div className="text-sm text-base-200">Current Net Worth</div>
          <div className="text-2xl font-semibold mt-1 text-base-200">
            $
            {totalNetWorth.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="card p-5 bg-base-100 shadow">
          <div className="text-sm text-gray-600">Interest This Month</div>
          <div className="text-2xl font-semibold mt-1">
            $
            {monthlyInterest.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="card p-5 bg-base-100 shadow">
          <div className="text-sm text-gray-600">Number of Accounts</div>
          <div className="text-2xl font-semibold mt-1">
            {subAccounts.length}
          </div>
        </div>
      </div>

      <div className="card p-6 bg-white shadow">
        <div style={{ height: 240 }}>
          <NetWorthLineChart dates={dates} netWorths={netWorths} />
        </div>
        <div className="flex justify-center mt-4">
          <div className="inline-flex bg-gray-200 rounded-full p-1">
            {TIMEFRAMES.map(({ label }, idx) => (
              <button
                key={label}
                onClick={() => setTf(label)}
                className={`btn btn-sm ${
                  tf === label
                    ? "bg-white text-primary shadow"
                    : "bg-transparent text-gray-600"
                } ${
                  idx === 0
                    ? "rounded-l-full"
                    : idx === TIMEFRAMES.length - 1
                    ? "rounded-r-full"
                    : "rounded-none"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6 bg-white shadow space-y-3">
        <h1 className="font-bold text-xl">Accounts</h1>
        {subAccounts.length === 0 ? (
          <p className="text-base-content text-sm">
            No accounts assigned to this member.
          </p>
        ) : (
          subAccounts.map((acc) => (
            <Link
              key={acc._id}
              to={`/accounts/${acc._id}`}
              className="group flex justify-between items-center px-4 py-3 bg-base-200 shadow rounded-lg"
            >
              <div>
                <div className="font-medium">{acc.name}</div>
                <div className="text-xs">{acc.type}</div>
              </div>
              <div className="font-bold">
                $
                {acc.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
