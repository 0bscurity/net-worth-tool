// import { useAuth0 } from "@auth0/auth0-react";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccounts } from "../features/accounts/useAccounts";
import NetWorthLineChart from "../components/ui/charts/NetWorthLineChart";
import { useIsMobile } from "../hooks/useIsMobile";

const TIMEFRAMES = [
  { label: "W", days: 7 },
  { label: "M", days: 30 },
  { label: "6M", days: 182 },
  { label: "Y", days: 365 },
  { label: "All", days: Infinity },
];

export default function Dashboard() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const [visibleCount, setVisibleCount] = useState(5);
  const isMobile = useIsMobile();

  // calculate totals & chart data
  const totalNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

  // slice for pagination
  const visibleAccounts = accounts.slice(0, visibleCount);
  const hasMore = accounts.length > visibleCount;

  const [tf, setTf] = useState("All");

  // 1) flatten all contributions
  const allContribs = useMemo(
    () =>
      accounts.flatMap((acct) =>
        (acct.contributions || []).map((c) => ({
          date: new Date(c.date),
          delta: c.type === "withdrawal" ? -c.amount : c.amount,
        }))
      ),
    [accounts]
  );

  // 2) group by YYYY-MM-DD, sum deltas
  const grouped = useMemo(() => {
    const map = {};
    allContribs.forEach(({ date, delta }) => {
      const key = date.toISOString().slice(0, 10);
      map[key] = (map[key] || 0) + delta;
    });
    return map;
  }, [allContribs]);

  // 3) build full, sorted, cumulative timeline
  const fullTimeline = useMemo(() => {
    const days = Object.keys(grouped).sort();
    let running = 0;
    return days.map((day) => {
      running += grouped[day];
      return { date: day, netWorth: running };
    });
  }, [grouped]);

  // 4) filter by tf
  const filteredTimeline = useMemo(() => {
    if (tf === "All") return fullTimeline;
    const days = TIMEFRAMES.find((t) => t.label === tf).days;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return fullTimeline.filter((pt) => new Date(pt.date).getTime() >= cutoff);
  }, [fullTimeline, tf]);

  // 5) extract arrays
  const dates = filteredTimeline.map((pt) => pt.date);
  const netWorths = filteredTimeline.map((pt) => pt.netWorth);

  // const perBarHeight = 21;
  // const minHeight = 200;
  // const chartHeight = Math.max(minHeight, labels.length * perBarHeight);

  return (
    <div className="px-0 mt-5 mb-5 max-w-5xl mx-auto">
      <div className="space-y-6 flex-1">
        {/* Summary + Chart */}
        <div className="card bg-white shadow-lg flex flex-col lg:flex-row">
          {/* 1) Left col: header */}
          <div className="px-6 lg:px-12 pt-6 lg:pt-12 mb-6 lg:mb-0">
            <div className="text-lg font-semibold text-gray-500 mb-2">
              Your Net Worth
            </div>
            <div className="text-4xl md:text-5xl font-extrabold text-primary">
              $
              {totalNetWorth.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* 2) Right col: chart + pills stacked */}
          <div className="flex-1 flex flex-col px-2 lg:px-12 lg:pt-12">
            {/* Chart always full-width */}
            <div className="w-full flex-1">
              <NetWorthLineChart dates={dates} netWorths={netWorths} />
            </div>

            {/* Pills always under the chart */}
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
                ${idx > 0 && idx < TIMEFRAMES.length - 1 ? "rounded-none" : ""}
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

        {/* Accounts Breakdown */}
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
                <p className="text-gray-500">
                  No accounts yet. Click “+” above to add one.
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

          {/* Goals (empty for now) */}
          <div className="card bg-white shadow-lg p-6 flex flex-col items-between justify-top">
            <div className="flex justify-between">
              <h3 className="text-xl font-semibold mb-4">Goals</h3>
              {/* <Link to="/goals/new" className="btn btn-primary">
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </Link> */}
            </div>

            {/* <Link to="/goals/new" className="btn btn-primary mt-5">
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              New Goal
            </Link> */}
            <p className="text-sm">Coming Soon . . .</p>
          </div>
        </div>

        {/* 4) Quick‐nav Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/accounts"
            className="card bg-white shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🏦</span>
              <div>
                <div className="font-semibold text-primary">Accounts</div>
                <div className="text-sm text-gray-500">
                  Manage your accounts
                </div>
              </div>
            </div>
          </Link>
          <Link
            to="/goals"
            className="card bg-white shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-semibold text-secondary">Goals</div>
                <div className="text-sm text-gray-500">
                  Track your savings goals
                </div>
              </div>
            </div>
          </Link>
          <Link
            to="/institutions"
            className="card bg-white shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🏛️</span>
              <div>
                <div className="font-semibold text-accent">Institutions</div>
                <div className="text-sm text-gray-500">Banks & brokers</div>
              </div>
            </div>
          </Link>
          <Link
            to="/sub-users"
            className="card bg-white shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">👥</span>
              <div>
                <div className="font-semibold text-info">Sub-Users</div>
                <div className="text-sm text-gray-500">Household members</div>
              </div>
            </div>
          </Link>
        </div> */}
      </div>
    </div>
  );
}
