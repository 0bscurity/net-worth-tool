// src/pages/Dashboard.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccounts } from "../features/accounts/useAccounts";
import { useSubusers } from "../features/subusers/useSubusers";
import NetWorthLineChart from "../components/ui/charts/NetWorthLineChart";

const TIMEFRAMES = [
  { label: "W", days: 7 },
  { label: "M", days: 30 },
  { label: "6M", days: 182 },
  { label: "Y", days: 365 },
  { label: "All", days: Infinity },
];

export default function Dashboard() {
  // accounts
  const { accounts, loading: accountsLoading } = useAccounts();
  const [visibleCount, setVisibleCount] = useState(5);
  const visibleAccounts = accounts.slice(0, visibleCount);
  const hasMore = accounts.length > visibleCount;

  // sub-users
  const { subusers, loading: subLoading, error: subError } = useSubusers();

  const balancesBySub = useMemo(() => {
    const map = { primary: 0 };
    accounts.forEach((a) => {
      const key = a.subuserId || "primary";
      map[key] = (map[key] || 0) + a.balance;
    });

    const arr = [
      {
        id: "primary",
        name: "Primary User",
        balance: map.primary,
      },
    ];

    subusers.forEach((s) => {
      arr.push({
        id: s._id,
        name: s.name,
        balance: map[s._id] || 0,
      });
    });

    return arr;
  }, [accounts, subusers]);

  // Net worth history
  const totalNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const monthlyInterest = useMemo(
    () =>
      accounts.reduce(
        (sum, a) => sum + a.balance * ((a.interest || 0) / 12),
        0
      ),
    [accounts]
  );

  const [tf, setTf] = useState("All");

  // build contribution timeline...
  const allContribs = useMemo(
    () =>
      accounts.flatMap((acct) =>
        acct.contributions.map((c) => ({
          date: new Date(c.date),
          delta: c.type === "withdrawal" ? -c.amount : c.amount,
        }))
      ),
    [accounts]
  );
  const grouped = useMemo(() => {
    const m = {};
    allContribs.forEach(({ date, delta }) => {
      const k = date.toISOString().slice(0, 10);
      m[k] = (m[k] || 0) + delta;
    });
    return m;
  }, [allContribs]);
  const fullTimeline = useMemo(() => {
    const days = Object.keys(grouped).sort();
    let running = 0;
    return days.map((day) => {
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
  const dates = filteredTimeline.map((pt) => pt.date);
  const netWorths = filteredTimeline.map((pt) => pt.netWorth);

  return (
    <div className="px-0 mt-5 mb-5 max-w-5xl mx-auto">
      <div className="space-y-6 flex-1">
        {/* 1) Net worth summary + chart */}
        <div className="card bg-white shadow-lg flex flex-col lg:flex-row">
          <div className="px-6 lg:px-12 pt-6 lg:pt-12 mb-6 lg:mb-0">
            <div className="text-lg font-semibold text-gray-500 mb-2">
              Your Net Worth
            </div>
            <div className="text-4xl md:text-5xl font-extrabold text-primary">
              $
              {totalNetWorth.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>

            <div className="flex items-center mt-6 mb-1">
              <span className="text-lg font-semibold text-gray-500">
                Monthly Passive Income
              </span>
              <div
                className="tooltip tooltip-top ml-2"
                data-tip="Interest and Dividend payments"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>
            </div>

            {/* The number */}
            <div className="text-3xl font-bold text-green-500">
              $
              {monthlyInterest.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="flex-1 flex flex-col px-2 lg:px-12 lg:pt-12">
            <div className="w-full flex-1">
              <NetWorthLineChart dates={dates} netWorths={netWorths} />
            </div>
            <div className="mt-4 mb-6 flex justify-center">
              <div className="inline-flex bg-gray-200 rounded-full p-1">
                {TIMEFRAMES.map(({ label }, idx) => {
                  const isActive = tf === label;
                  return (
                    <button
                      key={label}
                      onClick={() => setTf(label)}
                      className={`
                        btn btn-sm
                        ${
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
        </div>
        {/* 2) Accounts breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-primary shadow-lg p-6 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-base-200">
                Your Accounts
              </h3>
              <Link
                to="/add-account"
                className="btn btn-base btn-circle btn-sm"
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
              </Link>
            </div>
            <div className="space-y-2 mt-3">
              {accountsLoading ? (
                <p className="text-gray-500">Loading your accounts…</p>
              ) : visibleAccounts.length === 0 ? (
                <p className="text-base-200 text-sm">
                  No financial accounts added yet. Click “+” above to add one.
                </p>
              ) : (
                visibleAccounts.map((acc) => (
                  <Link
                    key={acc._id}
                    to={`/accounts/${acc._id}`}
                    className="group flex justify-between items-center px-4 py-3 bg-white hover:bg-base-200 shadow rounded-lg cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">
                        {acc.name || acc.institution}
                      </div>
                      <div className="text-xs text-gray-500">{acc.type}</div>
                    </div>
                    <div className="flex items-center space-x-5">
                      <div className="text-black font-bold">
                        $
                        {acc.balance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5 text-gray-400 transform transition-transform duration-200 group-hover:translate-x-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </div>
                  </Link>
                ))
              )}
              {hasMore && (
                <div className="flex justify-center mt-4">
                  <button
                    className="btn btn-sm"
                    onClick={() => setVisibleCount((c) => c + 3)}
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* 3) Manage Sub-Users */}
          <div className="card bg-white shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-top mb-4">
              <div>
                <h3 className="text-lg font-semibold">Manage Sub-Users</h3>
                <p className="text-sm">Designate account owners</p>
              </div>
              <Link
                to="/sub-users/new"
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
              </Link>
            </div>

            <div className="space-y-2 mt-3">
              {subLoading ? (
                <p className="text-gray-500">Loading household members…</p>
              ) : subError ? (
                <p className="text-red-500">Error loading sub-users</p>
              ) : balancesBySub.length > 0 ? (
                balancesBySub.slice(0, 5).map(({ id, name, balance }) => (
                  <Link
                    key={id}
                    to={
                      id === "primary"
                        ? "/sub-users/primary"
                        : `/sub-users/${id}`
                    }
                    className="group flex justify-between items-center px-4 py-3 bg-primary text-base-200 shadow rounded-lg cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-xs text-base-200">
                        {id === "primary" ? "You" : "User"}
                      </div>
                    </div>
                    <div className="flex items-center space-x-5">
                      <div className="font-bold">
                        $
                        {balance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5 text-base-200 transform transition-transform duration-200 group-hover:translate-x-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm">
                  No sub-users yet. Click “+” above to add one.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
