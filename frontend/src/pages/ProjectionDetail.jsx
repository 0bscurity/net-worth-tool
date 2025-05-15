// src/pages/ProjectionDetail.jsx
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useProjection } from "../features/projections/useProjection";
import { useAccounts } from "../features/accounts/useAccounts";
import NetWorthLineChart from "../components/ui/charts/NetWorthLineChart";

export default function ProjectionDetail() {
  const { id } = useParams();
  const { projection, labels = [], nwSeries = [], acctSeries = {}, loading, error } = useProjection(id);
  const { accounts, loading: accLoading, error: accError } = useAccounts();

  // Compute selected accounts (always run for hook order stability)
  const selectedAccounts = projection?.allocations.map(a => {
    const acct = accounts.find(acc => acc._id === a.accountId);
    return {
      ...a,
      accountName: acct?.name || a.accountId,
      balanceSeries: acctSeries[a.accountId] || [],
      interestRate: acct?.interest || 0,
      dividend: acct?.dividend || 0,
    };
  }) || [];

  // Hook: calculate this month's projected interest
  const thisMonthInterest = useMemo(() => {
    return selectedAccounts.reduce((sum, sa) => {
      const series = sa.balanceSeries;
      if (!series || series.length < 2) return sum;
      const prevBal = series[series.length - 2];
      const rate = (sa.interestRate + sa.dividend) / 100 / 12;
      return sum + prevBal * rate;
    }, 0);
  }, [selectedAccounts]);

  if (loading || accLoading) return <div>Loading…</div>;
  if (error || accError) return <div className="text-red-500">Error loading data</div>;
  if (!projection) return <div>No projection found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">{projection.name}</h1>

      <div className="h-64">
        <NetWorthLineChart dates={labels} netWorths={nwSeries} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <div className="text-sm text-gray-600">This Month&apos;s Projected Interest:</div>
          <div className="text-lg font-semibold text-blue-600 mt-1">
            ${thisMonthInterest.toFixed(2)}
          </div>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <div className="text-sm text-gray-600">Selected Accounts:</div>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {selectedAccounts.map(sa => (
              <li key={sa.accountId} className="flex justify-between">
                <span>{sa.accountName}</span>
                <span>${sa.monthlyAmount.toFixed(2)}/mo</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
